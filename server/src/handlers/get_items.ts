import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type Item } from '../schema';

export const getItems = async (): Promise<Item[]> => {
  try {
    // Query all items from the database
    const results = await db.select()
      .from(itemsTable)
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(item => ({
      ...item,
      price: parseFloat(item.price) // Convert string back to number for numeric column
    }));
  } catch (error) {
    console.error('Failed to fetch items:', error);
    throw error;
  }
};