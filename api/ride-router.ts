import { z } from "zod";
import { eq, and, desc, isNull, or } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { drivers, rides, earnings } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const rideRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const driver = await db.query.drivers.findFirst({
      where: eq(drivers.userId, ctx.user.id),
    });
    if (!driver) return [];
    return db.query.rides.findMany({
      where: eq(rides.driverId, driver.id),
      orderBy: desc(rides.createdAt),
    });
  }),

  pending: authedQuery.query(async () => {
    const db = getDb();
    return db.query.rides.findMany({
      where: and(eq(rides.status, "pending"), isNull(rides.driverId)),
      orderBy: desc(rides.createdAt),
    });
  }),

  myActiveRide: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const driver = await db.query.drivers.findFirst({
      where: eq(drivers.userId, ctx.user.id),
    });
    if (!driver) return null;
    const ride = await db.query.rides.findFirst({
      where: and(
        eq(rides.driverId, driver.id),
        or(eq(rides.status, "accepted"), eq(rides.status, "in_progress"))
      ),
      orderBy: desc(rides.createdAt),
    });
    return ride ?? null;
  }),

  create: publicQuery
    .input(
      z.object({
        pickupAddress: z.string().min(1),
        pickupLat: z.number().optional(),
        pickupLng: z.number().optional(),
        destinationAddress: z.string().optional(),
        destinationLat: z.number().optional(),
        destinationLng: z.number().optional(),
        price: z.number().positive(),
        distance: z.number().optional(),
        clientPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(rides).values({
        pickupAddress: input.pickupAddress,
        pickupLat: input.pickupLat?.toFixed(8),
        pickupLng: input.pickupLng?.toFixed(8),
        destinationAddress: input.destinationAddress,
        destinationLat: input.destinationLat?.toFixed(8),
        destinationLng: input.destinationLng?.toFixed(8),
        price: input.price.toFixed(2),
        distance: input.distance?.toFixed(2),
        clientPhone: input.clientPhone,
        status: "pending",
      });
      return { success: true, rideId: Number(result[0].insertId) };
    }),

  accept: authedQuery
    .input(z.object({ rideId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const driver = await db.query.drivers.findFirst({
        where: eq(drivers.userId, ctx.user.id),
      });
      if (!driver) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Driver not found" });
      }
      if (driver.status === "on_ride") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You already have an active ride",
        });
      }
      const ride = await db.query.rides.findFirst({
        where: eq(rides.id, input.rideId),
      });
      if (!ride || ride.status !== "pending") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ride not available",
        });
      }
      await db
        .update(rides)
        .set({
          status: "accepted",
          driverId: driver.id,
          acceptedAt: new Date(),
        })
        .where(eq(rides.id, input.rideId));
      await db
        .update(drivers)
        .set({ status: "on_ride" })
        .where(eq(drivers.id, driver.id));
      return { success: true };
    }),

  decline: authedQuery
    .input(z.object({ rideId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const driver = await db.query.drivers.findFirst({
        where: eq(drivers.userId, ctx.user.id),
      });
      if (!driver) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Driver not found" });
      }
      await db
        .update(rides)
        .set({ status: "declined", driverId: driver.id })
        .where(eq(rides.id, input.rideId));
      return { success: true };
    }),

  startRide: authedQuery
    .input(z.object({ rideId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const driver = await db.query.drivers.findFirst({
        where: eq(drivers.userId, ctx.user.id),
      });
      if (!driver) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Driver not found" });
      }
      const ride = await db.query.rides.findFirst({
        where: and(eq(rides.id, input.rideId), eq(rides.driverId, driver.id)),
      });
      if (!ride || ride.status !== "accepted") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ride not found" });
      }
      await db
        .update(rides)
        .set({ status: "in_progress" })
        .where(eq(rides.id, input.rideId));
      return { success: true };
    }),

  complete: authedQuery
    .input(z.object({ rideId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const driver = await db.query.drivers.findFirst({
        where: eq(drivers.userId, ctx.user.id),
      });
      if (!driver) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Driver not found" });
      }
      const ride = await db.query.rides.findFirst({
        where: and(eq(rides.id, input.rideId), eq(rides.driverId, driver.id)),
      });
      if (!ride || ride.status !== "in_progress") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ride not in progress",
        });
      }
      const price = parseFloat(ride.price);
      const newDaily = parseFloat(driver.dailyEarnings) + price;
      const newTotal = parseFloat(driver.totalEarnings) + price;

      await db
        .update(rides)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(rides.id, input.rideId));

      await db
        .update(drivers)
        .set({
          status: "online",
          dailyEarnings: newDaily.toFixed(2),
          totalEarnings: newTotal.toFixed(2),
          totalRides: driver.totalRides + 1,
        })
        .where(eq(drivers.id, driver.id));

      await db.insert(earnings).values({
        driverId: driver.id,
        rideId: ride.id,
        amount: ride.price,
        description: `Course ${ride.pickupAddress} -> ${ride.destinationAddress || "N/A"}`,
      });

      return { success: true, earnings: price };
    }),

  cancel: authedQuery
    .input(z.object({ rideId: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const driver = await db.query.drivers.findFirst({
        where: eq(drivers.userId, ctx.user.id),
      });
      if (!driver) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Driver not found" });
      }
      const ride = await db.query.rides.findFirst({
        where: and(eq(rides.id, input.rideId), eq(rides.driverId, driver.id)),
      });
      if (!ride) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ride not found" });
      }
      await db
        .update(rides)
        .set({ status: "cancelled" })
        .where(eq(rides.id, input.rideId));
      await db
        .update(drivers)
        .set({ status: "online" })
        .where(eq(drivers.id, driver.id));
      return { success: true };
    }),
});
