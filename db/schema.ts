import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const drivers = mysqlTable("drivers", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  phone: varchar("phone", { length: 50 }),
  status: mysqlEnum("status", ["offline", "online", "on_ride", "busy"])
    .default("offline")
    .notNull(),
  currentLat: decimal("current_lat", { precision: 10, scale: 8 }),
  currentLng: decimal("current_lng", { precision: 11, scale: 8 }),
  dailyEarnings: decimal("daily_earnings", { precision: 10, scale: 2 }).default("0").notNull(),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0").notNull(),
  totalRides: bigint("total_rides", { mode: "number", unsigned: true }).default(0).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  vehicleType: varchar("vehicle_type", { length: 100 }),
  licensePlate: varchar("license_plate", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

export const rides = mysqlTable("rides", {
  id: serial("id").primaryKey(),
  driverId: bigint("driver_id", { mode: "number", unsigned: true }).references(() => drivers.id, { onDelete: "set null" }),
  clientPhone: varchar("client_phone", { length: 50 }),
  pickupAddress: text("pickup_address").notNull(),
  pickupLat: decimal("pickup_lat", { precision: 10, scale: 8 }),
  pickupLng: decimal("pickup_lng", { precision: 11, scale: 8 }),
  destinationAddress: text("destination_address"),
  destinationLat: decimal("destination_lat", { precision: 10, scale: 8 }),
  destinationLng: decimal("destination_lng", { precision: 11, scale: 8 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  distance: decimal("distance", { precision: 6, scale: 2 }),
  status: mysqlEnum("status", ["pending", "accepted", "in_progress", "completed", "declined", "cancelled"])
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

export type Ride = typeof rides.$inferSelect;
export type InsertRide = typeof rides.$inferInsert;

export const earnings = mysqlTable("earnings", {
  id: serial("id").primaryKey(),
  driverId: bigint("driver_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => drivers.id, { onDelete: "cascade" }),
  rideId: bigint("ride_id", { mode: "number", unsigned: true })
    .references(() => rides.id, { onDelete: "set null" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  description: varchar("description", { length: 255 }),
});

export type Earning = typeof earnings.$inferSelect;
export type InsertEarning = typeof earnings.$inferInsert;
