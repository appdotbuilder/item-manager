import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type GetItemInput, type CreateItemInput } from '../schema';
import { getItem } from '../handlers/get_item';

// Test setup data
const testItem: CreateItemInput = {
  name: 'Test Item',
  description: 'A test item for get_item handler',
  price: 25.99,
  quantity: 50
};

const testItemWithNull: CreateItemInput = {
  name: 'Item with null description',
  description: null,
  price: 15.50,
  quantity: 25
};

describe('getItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should retrieve an existing item by ID', async () => {
    // Create a test item first
    const insertResult = await db.insert(itemsTable)
      .values({
        name: testItem.name,
        description: testItem.description,
        price: testItem.price.toString(), // Convert to string for DB
        quantity: testItem.quantity
      })
      .returning()
      .execute();

    const createdItem = insertResult[0];
    
    // Test retrieving the item
    const input: GetItemInput = { id: createdItem.id };
    const result = await getItem(input);

    // Verify the item was retrieved correctly
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdItem.id);
    expect(result!.name).toEqual('Test Item');
    expect(result!.description).toEqual('A test item for get_item handler');
    expect(result!.price).toEqual(25.99);
    expect(typeof result!.price).toBe('number'); // Verify numeric conversion
    expect(result!.quantity).toEqual(50);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent item ID', async () => {
    const input: GetItemInput = { id: 999 };
    const result = await getItem(input);

    expect(result).toBeNull();
  });

  it('should handle item with null description', async () => {
    // Create item with null description
    const insertResult = await db.insert(itemsTable)
      .values({
        name: testItemWithNull.name,
        description: testItemWithNull.description,
        price: testItemWithNull.price.toString(),
        quantity: testItemWithNull.quantity
      })
      .returning()
      .execute();

    const createdItem = insertResult[0];

    // Test retrieving the item
    const input: GetItemInput = { id: createdItem.id };
    const result = await getItem(input);

    // Verify null description is handled correctly
    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Item with null description');
    expect(result!.description).toBeNull();
    expect(result!.price).toEqual(15.50);
    expect(typeof result!.price).toBe('number');
    expect(result!.quantity).toEqual(25);
  });

  it('should retrieve correct item when multiple items exist', async () => {
    // Create multiple test items
    const item1Result = await db.insert(itemsTable)
      .values({
        name: 'First Item',
        description: 'First test item',
        price: '10.00',
        quantity: 10
      })
      .returning()
      .execute();

    const item2Result = await db.insert(itemsTable)
      .values({
        name: 'Second Item',
        description: 'Second test item',
        price: '20.00',
        quantity: 20
      })
      .returning()
      .execute();

    // Retrieve the second item specifically
    const input: GetItemInput = { id: item2Result[0].id };
    const result = await getItem(input);

    // Verify we got the correct item
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(item2Result[0].id);
    expect(result!.name).toEqual('Second Item');
    expect(result!.description).toEqual('Second test item');
    expect(result!.price).toEqual(20.00);
    expect(result!.quantity).toEqual(20);

    // Verify it's not the first item
    expect(result!.id).not.toEqual(item1Result[0].id);
    expect(result!.name).not.toEqual('First Item');
  });

  it('should handle decimal prices correctly', async () => {
    // Create item with precise decimal price
    const insertResult = await db.insert(itemsTable)
      .values({
        name: 'Decimal Price Item',
        description: 'Testing decimal precision',
        price: '123.45',
        quantity: 1
      })
      .returning()
      .execute();

    const input: GetItemInput = { id: insertResult[0].id };
    const result = await getItem(input);

    // Verify decimal precision is maintained
    expect(result).not.toBeNull();
    expect(result!.price).toEqual(123.45);
    expect(typeof result!.price).toBe('number');
  });
});