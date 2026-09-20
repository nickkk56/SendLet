import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").unique().notNull(),
  confirmed: integer("confirmed", { mode: "boolean" }).notNull().default(false),
  confirmToken: text("confirm_token"),
  unsubscribeToken: text("unsubscribe_token").unique().notNull(),
  subscribedAt: integer("subscribed_at", { mode: "timestamp" }).notNull(),
  confirmedAt: integer("confirmed_at", { mode: "timestamp" }),
  unsubscribedAt: integer("unsubscribed_at", { mode: "timestamp" }),
  source: text("source"),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
