import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text().notNull().unique(),
  email: text().notNull().unique(),
  registrationRecord: text().notNull(),
  totp_secret: text(),
  totp_lastTimeStep: integer(),
});
