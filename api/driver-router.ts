import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { drivers } from "@db/schema";
import { TRPCError } from "@trpc/server";

export const driverRouter = createRouter({
  me: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const driver = await db.query.drivers.findFirst({
      where: eq(drivers.userId, ctx.user.id),
      with: { user: true },
    });
    return driver ?? null;
  }),

  register: authedQuery
    .input(
      z.object({
        phone: z.string().min(6).max(50),
        vehicleType: z.string().min(1).max(100).optional(),
        licensePlate: z.string().min(1).max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.drivers.findFirst({
        where: eq(drivers.userId, ctx.user.id),
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Driver profile already exists",
        });
      }
      await db.insert(drivers).values({
        userId: ctx.user.id,
        phone: input.phone,
        vehicleType: input.vehicleType,
        licensePlate: input.licensePlate,
        status: "offline",
        dailyEarnings: "0",
        totalEarnings: "0",
        totalRides: 0,
      });
      const driver = await db.query.drivers.findFirst({
        where: eq(drivers.userId, ctx.user.id),
      });
      return driver;
    }),

  updateStatus: authedQuery
    .input(z.object({ status: z.enum(["offline", "online", "on_ride", "busy"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const driver = await db.query.drivers.findFirst({
        where: eq(drivers.userId, ctx.user.id),
      });
      if (!driver) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Driver not found" });
      }
      await db
        .update(drivers)
        .set({ status: input.status })
        .where(eq(drivers.id, driver.id));
      return { success: true, status: input.status };
    }),

  updateLocation: authedQuery
    .input(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const driver = await db.query.drivers.findFirst({
        where: eq(drivers.userId, ctx.user.id),
      });
      if (!driver) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Driver not found" });
      }
      await db
        .update(drivers)
        .set({ currentLat: input.lat.toFixed(8), currentLng: input.lng.toFixed(8) })
        .where(eq(drivers.id, driver.id));
      return { success: true };
    }),

  resetDailyEarnings: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const driver = await db.query.drivers.findFirst({
      where: eq(drivers.userId, ctx.user.id),
    });
    if (!driver) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Driver not found" });
    }
    await db
      .update(drivers)
      .set({ dailyEarnings: "0" })
      .where(eq(drivers.id, driver.id));
    return { success: true };
  }),
});
