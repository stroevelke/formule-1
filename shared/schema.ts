import { pgTable, text, serial, integer, boolean, json, timestamp, doublePrecision, varchar, foreignKey, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  // Extra velden voor gebruikersprofiel
  email: text("email"),
  favorite_driver: integer("favorite_driver"),
  favorite_team: text("favorite_team"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  favorite_driver: true,
  favorite_team: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Database tabellen voor F1-gegevens
export const f1Sessions = pgTable("f1_sessions", {
  id: serial("id").primaryKey(),
  session_key: integer("session_key").notNull().unique(),
  meeting_key: integer("meeting_key").notNull(),
  meeting_name: text("meeting_name").notNull(),
  country_name: text("country_name").notNull(),
  circuit_short_name: text("circuit_short_name").notNull(),
  session_name: text("session_name").notNull(),
  date_start: timestamp("date_start").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const f1Drivers = pgTable("f1_drivers", {
  id: serial("id").primaryKey(),
  driver_number: integer("driver_number").notNull(),
  broadcast_name: text("broadcast_name").notNull(),
  full_name: text("full_name").notNull(),
  name_acronym: varchar("name_acronym", { length: 3 }).notNull(),
  team_name: text("team_name").notNull(),
  team_colour: varchar("team_colour", { length: 6 }).notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  headshot_url: text("headshot_url"),
  country_code: varchar("country_code", { length: 3 }).notNull(),
  session_key: integer("session_key").notNull(),
  meeting_key: integer("meeting_key").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Voeg unieke constraint toe om dubbele drivers per sessie te voorkomen
export const f1DriversConstraints = unique("f1_drivers_unique").on(
  f1Drivers.driver_number,
  f1Drivers.session_key
);

// Relaties definiëren tussen tabellen
export const f1DriversRelations = relations(f1Drivers, ({ one }) => ({
  session: one(f1Sessions, {
    fields: [f1Drivers.session_key],
    references: [f1Sessions.session_key],
  }),
}));

export const usersFavoriteDriversRelations = relations(users, ({ one }) => ({
  favoriteDriver: one(f1Drivers, {
    fields: [users.favorite_driver],
    references: [f1Drivers.driver_number],
  }),
}));

// Define schema types for OpenF1 API data

export const f1SessionSchema = z.object({
  session_key: z.number(),
  meeting_key: z.number(),
  meeting_name: z.string(),
  country_name: z.string(),
  circuit_short_name: z.string(),
  session_name: z.string(),
  date_start: z.string()
});

export const f1DriverSchema = z.object({
  driver_number: z.number(),
  broadcast_name: z.string(),
  full_name: z.string(),
  name_acronym: z.string(),
  team_name: z.string(),
  team_colour: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  headshot_url: z.string().optional(),
  country_code: z.string(),
  session_key: z.number(),
  meeting_key: z.number(),
  position: z.number().optional() // Toegevoegd position veld voor eenvoudiger toegang
});

export const f1CarDataSchema = z.object({
  date: z.string(),
  driver_number: z.number(),
  speed: z.number(),
  rpm: z.number(),
  throttle: z.number(),
  brake: z.number(),
  drs: z.number(),
  n_gear: z.number(),
  session_key: z.number(),
  meeting_key: z.number()
});

export const f1PositionSchema = z.object({
  date: z.string(),
  driver_number: z.number(),
  position: z.number(),
  session_key: z.number(),
  meeting_key: z.number()
});

export const f1LapSchema = z.object({
  date_start: z.string(),
  driver_number: z.number(),
  lap_number: z.number(),
  lap_duration: z.number().optional().nullable(),
  duration_sector_1: z.number().optional().nullable(),
  duration_sector_2: z.number().optional().nullable(),
  duration_sector_3: z.number().optional().nullable(),
  st_speed: z.number().optional().nullable(),
  i1_speed: z.number().optional().nullable(),
  i2_speed: z.number().optional().nullable(),
  is_pit_out_lap: z.boolean().optional(),
  session_key: z.number(),
  meeting_key: z.number()
});

export const f1LocationSchema = z.object({
  date: z.string(),
  driver_number: z.number(),
  x: z.number(),
  y: z.number(),
  z: z.number(),
  session_key: z.number(),
  meeting_key: z.number()
});

export const f1IntervalSchema = z.object({
  date: z.string(),
  driver_number: z.number(),
  interval: z.number().optional().nullable(),
  gap_to_leader: z.number().optional().nullable(),
  session_key: z.number(),
  meeting_key: z.number()
});

export const f1TeamRadioSchema = z.object({
  date: z.string(),
  driver_number: z.number(),
  recording_url: z.string(),
  session_key: z.number(),
  meeting_key: z.number()
});

export type F1Session = z.infer<typeof f1SessionSchema>;
export type F1Driver = z.infer<typeof f1DriverSchema>;
export type F1CarData = z.infer<typeof f1CarDataSchema>;
export type F1Position = z.infer<typeof f1PositionSchema>;
export type F1Lap = z.infer<typeof f1LapSchema>;
export type F1Location = z.infer<typeof f1LocationSchema>;
export type F1Interval = z.infer<typeof f1IntervalSchema>;
export type F1TeamRadio = z.infer<typeof f1TeamRadioSchema>;
