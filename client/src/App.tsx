import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package, Edit, AlertCircle } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { ItemForm } from '@/components/ItemForm';
import { ItemList } from '@/components/ItemList';
import { DeleteItemDialog } from '@/components/DeleteItemDialog';
import type { Item, CreateItemInput, UpdateItemInput } from '../../server/src/schema';

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setError(null);
      const result = await trpc.getItems.query();
      setItems(result);
    } catch (error) {
      console.error('Failed to load items:', error);
      setError('Failed to load items. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreateItem = async (data: CreateItemInput) => {
    setIsLoading(true);
    try {
      setError(null);
      const newItem = await trpc.createItem.mutate(data);
      setItems((prev: Item[]) => [...prev, newItem]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create item:', error);
      setError('Failed to create item. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async (data: UpdateItemInput) => {
    setIsLoading(true);
    try {
      setError(null);
      const updatedItem = await trpc.updateItem.mutate(data);
      setItems((prev: Item[]) => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to update item:', error);
      setError('Failed to update item. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    setIsLoading(true);
    try {
      setError(null);
      await trpc.deleteItem.mutate({ id });
      setItems((prev: Item[]) => prev.filter(item => item.id !== id));
      setDeletingItem(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
      setError('Failed to delete item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteClick = (item: Item) => {
    setDeletingItem(item);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-lg shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📦 Inventory Manager</h1>
              <p className="text-gray-600 mt-1">Manage your items efficiently</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Item
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-100">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalItems}</div>
              <p className="text-blue-200 text-sm mt-1">items in inventory</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-100">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalValue.toFixed(2)}</div>
              <p className="text-green-200 text-sm mt-1">inventory value</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-100">Avg. Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${totalItems > 0 ? (totalValue / totalItems).toFixed(2) : '0.00'}
              </div>
              <p className="text-purple-200 text-sm mt-1">per item</p>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {showForm ? (
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="flex items-center space-x-2">
                {editingItem ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                <span>{editingItem ? 'Edit Item' : 'Add New Item'}</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                {editingItem ? 'Update the item details below' : 'Fill in the details to add a new item'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {editingItem ? (
              <ItemForm
                initialData={{
                  id: editingItem.id,
                  name: editingItem.name,
                  description: editingItem.description,
                  price: editingItem.price,
                  quantity: editingItem.quantity
                }}
                onSubmit={handleUpdateItem}
                onCancel={handleCancelForm}
                isLoading={isLoading}
                mode="edit"
              />
            ) : (
              <ItemForm
                onSubmit={handleCreateItem}
                onCancel={handleCancelForm}
                isLoading={isLoading}
                mode="create"
              />
            )}
            </CardContent>
          </Card>
        ) : (
          <ItemList
            items={items}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            isLoading={isLoading}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteItemDialog
          item={deletingItem}
          onConfirm={() => deletingItem && handleDeleteItem(deletingItem.id)}
          onCancel={() => setDeletingItem(null)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default App;