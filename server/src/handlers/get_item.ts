import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type GetItemInput, type Item } from '../schema';
import { eq } from 'drizzle-orm';

export async function getItem(input: GetItemInput): Promise<Item | null> {
  try {
    // Query the specific item by ID
    const results = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, input.id))
      .execute();

    // Return null if item not found
    if (results.length === 0) {
      return null;
    }

    const item = results[0];

    // Convert numeric field back to number for schema compliance
    return {
      ...item,
      price: parseFloat(item.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Item retrieval failed:', error);
    throw error;
  }
}