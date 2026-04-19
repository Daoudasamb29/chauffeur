import { relations } from "drizzle-orm";
import { users, drivers, rides, earnings } from "./schema";

export const usersRelations = relations(users, ({ one }) => ({
  driver: one(drivers, {
    fields: [users.id],
    references: [drivers.userId],
  }),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id],
  }),
  rides: many(rides),
  earnings: many(earnings),
}));

export const ridesRelations = relations(rides, ({ one }) => ({
  driver: one(drivers, {
    fields: [rides.driverId],
    references: [drivers.id],
  }),
}));

export const earningsRelations = relations(earnings, ({ one }) => ({
  driver: one(drivers, {
    fields: [earnings.driverId],
    references: [drivers.id],
  }),
  ride: one(rides, {
    fields: [earnings.rideId],
    references: [rides.id],
  }),
}));
