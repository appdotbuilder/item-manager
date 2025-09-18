import { z } from 'zod';

// Item schema with proper numeric handling
export const itemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(), // Nullable field, not optional (can be explicitly null)
  price: z.number(), // Stored as numeric in DB, but we use number in TS
  quantity: z.number().int(), // Ensures integer values only
  created_at: z.coerce.date(), // Automatically converts string timestamps to Date objects
  updated_at: z.coerce.date()
});

export type Item = z.infer<typeof itemSchema>;

// Input schema for creating items
export const createItemInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(), // Explicit null allowed, undefined not allowed
  price: z.number().positive("Price must be positive"), // Validate that price is positive
  quantity: z.number().int().nonnegative("Quantity must be non-negative") // Validate that quantity is non-negative integer
});

export type CreateItemInput = z.infer<typeof createItemInputSchema>;

// Input schema for updating items
export const updateItemInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").optional(), // Optional = field can be undefined (omitted)
  description: z.string().nullable().optional(), // Can be null or undefined
  price: z.number().positive("Price must be positive").optional(),
  quantity: z.number().int().nonnegative("Quantity must be non-negative").optional()
});

export type UpdateItemInput = z.infer<typeof updateItemInputSchema>;

// Input schema for deleting items
export const deleteItemInputSchema = z.object({
  id: z.number()
});

export type DeleteItemInput = z.infer<typeof deleteItemInputSchema>;

// Input schema for getting a single item
export const getItemInputSchema = z.object({
  id: z.number()
});

export type GetItemInput = z.infer<typeof getItemInputSchema>;