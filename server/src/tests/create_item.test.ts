import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { itemsTable } from '../db/schema';
import { type CreateItemInput } from '../schema';
import { createItem } from '../handlers/create_item';
import { eq } from 'drizzle-orm';

// Test inputs with all required fields
const testInput: CreateItemInput = {
  name: 'Test Item',
  description: 'A test item description',
  price: 29.99,
  quantity: 50
};

const testInputWithNullDescription: CreateItemInput = {
  name: 'Item Without Description',
  description: null,
  price: 15.50,
  quantity: 10
};

describe('createItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an item with description', async () => {
    const result = await createItem(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Item');
    expect(result.description).toEqual('A test item description');
    expect(result.price).toEqual(29.99);
    expect(typeof result.price).toEqual('number');
    expect(result.quantity).toEqual(50);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toEqual('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an item with null description', async () => {
    const result = await createItem(testInputWithNullDescription);

    expect(result.name).toEqual('Item Without Description');
    expect(result.description).toBeNull();
    expect(result.price).toEqual(15.50);
    expect(typeof result.price).toEqual('number');
    expect(result.quantity).toEqual(10);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save item to database correctly', async () => {
    const result = await createItem(testInput);

    // Query using proper drizzle syntax
    const items = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, result.id))
      .execute();

    expect(items).toHaveLength(1);
    expect(items[0].name).toEqual('Test Item');
    expect(items[0].description).toEqual('A test item description');
    expect(parseFloat(items[0].price)).toEqual(29.99); // Database stores as string
    expect(items[0].quantity).toEqual(50);
    expect(items[0].created_at).toBeInstanceOf(Date);
    expect(items[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle decimal prices correctly', async () => {
    const decimalInput: CreateItemInput = {
      name: 'Decimal Price Item',
      description: 'Testing decimal precision',
      price: 123.45,
      quantity: 1
    };

    const result = await createItem(decimalInput);

    expect(result.price).toEqual(123.45);
    expect(typeof result.price).toEqual('number');

    // Verify in database
    const items = await db.select()
      .from(itemsTable)
      .where(eq(itemsTable.id, result.id))
      .execute();

    expect(parseFloat(items[0].price)).toEqual(123.45);
  });

  it('should generate unique IDs for multiple items', async () => {
    const input1: CreateItemInput = {
      name: 'Item 1',
      description: 'First item',
      price: 10.00,
      quantity: 5
    };

    const input2: CreateItemInput = {
      name: 'Item 2',
      description: 'Second item',
      price: 20.00,
      quantity: 10
    };

    const result1 = await createItem(input1);
    const result2 = await createItem(input2);

    expect(result1.id).toBeDefined();
    expect(result2.id).toBeDefined();
    expect(result1.id).not.toEqual(result2.id);
  });

  it('should handle zero quantity', async () => {
    const zeroQuantityInput: CreateItemInput = {
      name: 'Zero Quantity Item',
      description: 'Item with zero quantity',
      price: 5.99,
      quantity: 0
    };

    const result = await createItem(zeroQuantityInput);

    expect(result.quantity).toEqual(0);
    expect(result.name).toEqual('Zero Quantity Item');
    expect(result.price).toEqual(5.99);
  });

  it('should set created_at and updated_at timestamps', async () => {
    const beforeCreation = new Date();
    
    const result = await createItem(testInput);
    
    const afterCreation = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });
});