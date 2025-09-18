import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { itemsTable } from '../db/schema';
import { getItems } from '../handlers/get_items';

describe('getItems', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no items exist', async () => {
    const result = await getItems();
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all items from database', async () => {
    // Create test items directly in database
    await db.insert(itemsTable)
      .values([
        {
          name: 'Test Item 1',
          description: 'First test item',
          price: '19.99',
          quantity: 10
        },
        {
          name: 'Test Item 2',
          description: null, // Test nullable field
          price: '29.50',
          quantity: 5
        }
      ])
      .execute();

    const result = await getItems();

    expect(result).toHaveLength(2);
    
    // Verify first item
    expect(result[0].name).toEqual('Test Item 1');
    expect(result[0].description).toEqual('First test item');
    expect(result[0].price).toEqual(19.99);
    expect(typeof result[0].price).toBe('number'); // Verify numeric conversion
    expect(result[0].quantity).toEqual(10);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Verify second item with nullable description
    expect(result[1].name).toEqual('Test Item 2');
    expect(result[1].description).toBeNull();
    expect(result[1].price).toEqual(29.50);
    expect(typeof result[1].price).toBe('number'); // Verify numeric conversion
    expect(result[1].quantity).toEqual(5);
  });

  it('should handle items with various price formats correctly', async () => {
    // Create items with different price formats
    await db.insert(itemsTable)
      .values([
        {
          name: 'Whole Dollar Item',
          description: 'Item with whole dollar price',
          price: '25.00',
          quantity: 1
        },
        {
          name: 'Decimal Item',
          description: 'Item with decimal price',
          price: '15.75',
          quantity: 2
        },
        {
          name: 'Single Decimal Item',
          description: 'Item with single decimal',
          price: '9.50',
          quantity: 3
        }
      ])
      .execute();

    const result = await getItems();

    expect(result).toHaveLength(3);
    expect(result[0].price).toEqual(25.00);
    expect(result[1].price).toEqual(15.75);
    expect(result[2].price).toEqual(9.50);
    
    // Verify all prices are numbers
    result.forEach(item => {
      expect(typeof item.price).toBe('number');
    });
  });

  it('should return items ordered by creation time', async () => {
    // Create items at different times
    await db.insert(itemsTable)
      .values({
        name: 'First Item',
        description: 'Created first',
        price: '10.00',
        quantity: 1
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(itemsTable)
      .values({
        name: 'Second Item',
        description: 'Created second',
        price: '20.00',
        quantity: 2
      })
      .execute();

    const result = await getItems();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('First Item');
    expect(result[1].name).toEqual('Second Item');
    expect(result[0].created_at <= result[1].created_at).toBe(true);
  });

  it('should handle large quantity values correctly', async () => {
    // Test with large integer values
    await db.insert(itemsTable)
      .values({
        name: 'Bulk Item',
        description: 'Item with large quantity',
        price: '1.00',
        quantity: 999999
      })
      .execute();

    const result = await getItems();

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toEqual(999999);
    expect(typeof result[0].quantity).toBe('number');
  });
});