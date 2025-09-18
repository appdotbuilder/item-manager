import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type UpdateItemInput, type Item } from '../schema';
import { eq } from 'drizzle-orm';

export const updateItem = async (input: UpdateItemInput): Promise<Item> => {
  try {
    // First, check if the item exists
    const existingItems = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, input.id))
      .execute();

    if (existingItems.length === 0) {
      throw new Error(`Item with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof itemsTable.$inferInsert> = {
      updated_at: new Date() // Always update the timestamp
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    if (input.price !== undefined) {
      updateData.price = input.price.toString(); // Convert number to string for numeric column
    }

    if (input.quantity !== undefined) {
      updateData.quantity = input.quantity; // Integer column - no conversion needed
    }

    // Update the item
    const result = await db.update(itemsTable)
      .set(updateData)
      .where(eq(itemsTable.id, input.id))
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const updatedItem = result[0];
    return {
      ...updatedItem,
      price: parseFloat(updatedItem.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Item update failed:', error);
    throw error;
  }
};