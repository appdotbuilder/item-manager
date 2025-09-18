import { serial, text, pgTable, timestamp, numeric, integer } from 'drizzle-orm/pg-core';

export const itemsTable = pgTable('items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by default, matches Zod schema
  price: numeric('price', { precision: 10, scale: 2 }).notNull(), // Use numeric for monetary values with precision
  quantity: integer('quantity').notNull(), // Use integer for whole numbers
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Item = typeof itemsTable.$inferSelect; // For SELECT operations
export type NewItem = typeof itemsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { items: itemsTable };