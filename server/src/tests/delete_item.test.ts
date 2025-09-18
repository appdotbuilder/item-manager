import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type DeleteItemInput, type CreateItemInput } from '../schema';
import { deleteItem } from '../handlers/delete_item';
import { eq } from 'drizzle-orm';

// Helper function to create a test item
const createTestItem = async (overrides?: Partial<CreateItemInput>) => {
  const testItemData = {
    name: 'Test Item',
    description: 'A test item for deletion',
    price: 29.99,
    quantity: 5,
    ...overrides
  };

  const result = await db.insert(itemsTable)
    .values({
      name: testItemData.name,
      description: testItemData.description,
      price: testItemData.price.toString(), // Convert to string for numeric column
      quantity: testItemData.quantity
    })
    .returning()
    .execute();

  return result[0];
};

describe('deleteItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should successfully delete an existing item', async () => {
    // Create a test item first
    const testItem = await createTestItem();
    
    const input: DeleteItemInput = {
      id: testItem.id
    };

    const result = await deleteItem(input);

    // Verify the response
    expect(result.success).toBe(true);

    // Verify the item is actually deleted from the database
    const deletedItems = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, testItem.id))
      .execute();

    expect(deletedItems).toHaveLength(0);
  });

  it('should throw error when trying to delete non-existent item', async () => {
    const input: DeleteItemInput = {
      id: 999999 // Non-existent ID
    };

    await expect(deleteItem(input)).rejects.toThrow(/Item with ID 999999 not found/i);
  });

  it('should not affect other items when deleting one item', async () => {
    // Create multiple test items
    const testItem1 = await createTestItem({ name: 'Item 1' });
    const testItem2 = await createTestItem({ name: 'Item 2' });
    const testItem3 = await createTestItem({ name: 'Item 3' });

    // Delete only the second item
    const input: DeleteItemInput = {
      id: testItem2.id
    };

    const result = await deleteItem(input);
    expect(result.success).toBe(true);

    // Verify only the targeted item was deleted
    const remainingItems = await db.select()
      .from(itemsTable)
      .execute();

    expect(remainingItems).toHaveLength(2);
    
    const remainingIds = remainingItems.map(item => item.id);
    expect(remainingIds).toContain(testItem1.id);
    expect(remainingIds).toContain(testItem3.id);
    expect(remainingIds).not.toContain(testItem2.id);
  });

  it('should handle deletion of item with null description', async () => {
    // Create item with null description
    const testItem = await createTestItem({ description: null });

    const input: DeleteItemInput = {
      id: testItem.id
    };

    const result = await deleteItem(input);

    expect(result.success).toBe(true);

    // Verify deletion
    const deletedItems = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, testItem.id))
      .execute();

    expect(deletedItems).toHaveLength(0);
  });

  it('should handle deletion of item with zero quantity', async () => {
    // Create item with zero quantity
    const testItem = await createTestItem({ quantity: 0 });

    const input: DeleteItemInput = {
      id: testItem.id
    };

    const result = await deleteItem(input);

    expect(result.success).toBe(true);

    // Verify deletion
    const deletedItems = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, testItem.id))
      .execute();

    expect(deletedItems).toHaveLength(0);
  });
});