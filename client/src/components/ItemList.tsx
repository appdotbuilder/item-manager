import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, Package, DollarSign, Calendar, ShoppingCart } from 'lucide-react';
import type { Item } from '../../../server/src/schema';

interface ItemListProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  isLoading?: boolean;
}

export function ItemList({ items, onEdit, onDelete, isLoading }: ItemListProps) {
  if (items.length === 0) {
    return (
      <Card className="shadow-xl border-0">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gray-100 p-6 rounded-full">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Items Yet</h3>
              <p className="text-gray-500 max-w-md">
                Get started by adding your first item to the inventory. 
                Click the "Add New Item" button above to begin! 🚀
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">📋 Item Inventory</h2>
        <Badge variant="secondary" className="text-sm">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item: Item) => (
          <Card 
            key={item.id} 
            className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:scale-105"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </CardTitle>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(item)}
                    disabled={isLoading}
                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
                    disabled={isLoading}
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-green-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">Price</span>
                  </div>
                  <div className="text-xl font-bold text-green-700">
                    ${item.price.toFixed(2)}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-sm font-medium">Stock</span>
                  </div>
                  <Badge 
                    variant={item.quantity > 10 ? "default" : item.quantity > 0 ? "secondary" : "destructive"}
                    className="font-semibold"
                  >
                    {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
                  </Badge>
                </div>

                {/* Total Value */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-purple-600">
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-medium">Total Value</span>
                  </div>
                  <div className="text-lg font-bold text-purple-700">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>

                <Separator />

                {/* Dates */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {item.created_at.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Updated: {item.updated_at.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}