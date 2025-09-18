import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type CreateItemInput, type UpdateItemInput } from '../schema';
import { updateItem } from '../handlers/update_item';
import { eq } from 'drizzle-orm';

describe('updateItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test item
  const createTestItem = async (itemData: CreateItemInput) => {
    const result = await db.insert(itemsTable)
      .values({
        name: itemData.name,
        description: itemData.description,
        price: itemData.price.toString(), // Convert to string for numeric column
        quantity: itemData.quantity
      })
      .returning()
      .execute();

    return {
      ...result[0],
      price: parseFloat(result[0].price) // Convert back to number
    };
  };

  const testItemData: CreateItemInput = {
    name: 'Test Item',
    description: 'A test item description',
    price: 29.99,
    quantity: 50
  };

  it('should update an existing item with all fields', async () => {
    // Create test item
    const createdItem = await createTestItem(testItemData);

    const updateInput: UpdateItemInput = {
      id: createdItem.id,
      name: 'Updated Test Item',
      description: 'Updated description',
      price: 39.99,
      quantity: 75
    };

    const result = await updateItem(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(createdItem.id);
    expect(result.name).toEqual('Updated Test Item');
    expect(result.description).toEqual('Updated description');
    expect(result.price).toEqual(39.99);
    expect(typeof result.price).toBe('number');
    expect(result.quantity).toEqual(75);
    expect(result.created_at).toEqual(createdItem.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(createdItem.updated_at.getTime());
  });

  it('should update only specified fields', async () => {
    // Create test item
    const createdItem = await createTestItem(testItemData);

    const updateInput: UpdateItemInput = {
      id: createdItem.id,
      name: 'Partially Updated Item',
      price: 45.00
    };

    const result = await updateItem(updateInput);

    // Verify updated fields
    expect(result.name).toEqual('Partially Updated Item');
    expect(result.price).toEqual(45.00);
    expect(typeof result.price).toBe('number');
    
    // Verify unchanged fields
    expect(result.description).toEqual(createdItem.description);
    expect(result.quantity).toEqual(createdItem.quantity);
    expect(result.created_at).toEqual(createdItem.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null description update', async () => {
    // Create test item with non-null description
    const createdItem = await createTestItem(testItemData);

    const updateInput: UpdateItemInput = {
      id: createdItem.id,
      description: null
    };

    const result = await updateItem(updateInput);

    expect(result.description).toBeNull();
    expect(result.name).toEqual(createdItem.name); // Unchanged
    expect(result.price).toEqual(createdItem.price); // Unchanged
  });

  it('should save updated item to database', async () => {
    // Create test item
    const createdItem = await createTestItem(testItemData);

    const updateInput: UpdateItemInput = {
      id: createdItem.id,
      name: 'Database Test Item',
      quantity: 100
    };

    await updateItem(updateInput);

    // Query database directly to verify update
    const items = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, createdItem.id))
      .execute();

    expect(items).toHaveLength(1);
    expect(items[0].name).toEqual('Database Test Item');
    expect(items[0].quantity).toEqual(100);
    expect(parseFloat(items[0].price)).toEqual(testItemData.price); // Unchanged
    expect(items[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle zero and negative values correctly', async () => {
    // Create test item
    const createdItem = await createTestItem(testItemData);

    const updateInput: UpdateItemInput = {
      id: createdItem.id,
      price: 0.01, // Minimum positive price
      quantity: 0 // Minimum quantity
    };

    const result = await updateItem(updateInput);

    expect(result.price).toEqual(0.01);
    expect(typeof result.price).toBe('number');
    expect(result.quantity).toEqual(0);
  });

  it('should preserve precision for decimal prices', async () => {
    // Create test item
    const createdItem = await createTestItem(testItemData);

    const updateInput: UpdateItemInput = {
      id: createdItem.id,
      price: 123.45
    };

    const result = await updateItem(updateInput);

    expect(result.price).toEqual(123.45);
    expect(typeof result.price).toBe('number');
  });

  it('should throw error when item does not exist', async () => {
    const updateInput: UpdateItemInput = {
      id: 99999, // Non-existent ID
      name: 'This should fail'
    };

    await expect(updateItem(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should always update the updated_at timestamp', async () => {
    // Create test item
    const createdItem = await createTestItem(testItemData);
    
    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateItemInput = {
      id: createdItem.id,
      name: 'Timestamp Test'
    };

    const result = await updateItem(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(createdItem.updated_at.getTime());
    expect(result.created_at).toEqual(createdItem.created_at); // Should not change
  });

  it('should handle updating item with null description to non-null', async () => {
    // Create test item with null description
    const itemWithNullDesc: CreateItemInput = {
      name: 'Null Desc Item',
      description: null,
      price: 19.99,
      quantity: 10
    };

    const createdItem = await createTestItem(itemWithNullDesc);
    expect(createdItem.description).toBeNull();

    const updateInput: UpdateItemInput = {
      id: createdItem.id,
      description: 'Now has a description'
    };

    const result = await updateItem(updateInput);

    expect(result.description).toEqual('Now has a description');
  });
});