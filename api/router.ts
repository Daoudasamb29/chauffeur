import { authRouter } from "./auth-router";
import { driverRouter } from "./driver-router";
import { rideRouter } from "./ride-router";
import { earningsRouter } from "./earnings-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  driver: driverRouter,
  ride: rideRouter,
  earnings: earningsRouter,
});

export type AppRouter = typeof appRouter;
