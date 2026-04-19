import { eq, desc, gte, and } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { drivers, earnings } from "@db/schema";

export const earningsRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const driver = await db.query.drivers.findFirst({
      where: eq(drivers.userId, ctx.user.id),
    });
    if (!driver) return [];
    return db.query.earnings.findMany({
      where: eq(earnings.driverId, driver.id),
      orderBy: desc(earnings.date),
    });
  }),

  today: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const driver = await db.query.drivers.findFirst({
      where: eq(drivers.userId, ctx.user.id),
    });
    if (!driver) return { daily: 0, total: 0, rides: 0 };
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEarnings = await db.query.earnings.findMany({
      where: and(eq(earnings.driverId, driver.id), gte(earnings.date, todayStart)),
    });
    const todayTotal = todayEarnings.reduce(
      (sum, e) => sum + parseFloat(e.amount),
      0
    );
    return {
      daily: todayTotal,
      total: parseFloat(driver.totalEarnings),
      rides: driver.totalRides,
    };
  }),
});
