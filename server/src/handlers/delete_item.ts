import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type DeleteItemInput } from '../schema';
import { eq } from 'drizzle-orm';

export async function deleteItem(input: DeleteItemInput): Promise<{ success: boolean }> {
  try {
    // First check if the item exists
    const existingItems = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, input.id))
      .execute();

    if (existingItems.length === 0) {
      throw new Error(`Item with ID ${input.id} not found`);
    }

    // Delete the item
    const result = await db.delete(itemsTable)
      .where(eq(itemsTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Item deletion failed:', error);
    throw error;
  }
}