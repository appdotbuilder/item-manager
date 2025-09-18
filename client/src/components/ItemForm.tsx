import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, X, Package, DollarSign, Hash } from 'lucide-react';
import type { CreateItemInput, UpdateItemInput } from '../../../server/src/schema';

type ItemFormProps = {
  mode: 'create';
  onSubmit: (data: CreateItemInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
} | {
  mode: 'edit';
  initialData: UpdateItemInput;
  onSubmit: (data: UpdateItemInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

export function ItemForm(props: ItemFormProps) {
  const { onSubmit, onCancel, isLoading = false, mode } = props;
  const initialData = mode === 'edit' ? props.initialData : undefined;
  
  const [formData, setFormData] = useState<CreateItemInput>({
    name: initialData?.name || '',
    description: initialData?.description || null,
    price: initialData?.price || 0,
    quantity: initialData?.quantity || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'edit' && initialData?.id) {
        await (onSubmit as (data: UpdateItemInput) => Promise<void>)({
          id: initialData.id,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          quantity: formData.quantity
        });
      } else {
        await (onSubmit as (data: CreateItemInput) => Promise<void>)(formData);
      }
    } catch {
      // Error is handled by parent component
    }
  };

  const handleInputChange = (field: keyof CreateItemInput, value: string | number | null) => {
    setFormData((prev: CreateItemInput) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Basic Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Item Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('name', e.target.value)
                  }
                  placeholder="Enter item name..."
                  className={`mt-1 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange('description', e.target.value || null)
                  }
                  placeholder="Enter item description... (optional)"
                  className="mt-1 min-h-[100px]"
                  disabled={isLoading}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">Pricing & Inventory</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                  Price ($) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange('price', parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className={`mt-1 ${errors.price ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  Quantity *
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange('quantity', parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className={`pl-10 mt-1 ${errors.quantity ? 'border-red-500 focus:border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="min-w-[100px]"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[120px]"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            <div className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              {mode === 'edit' ? 'Update Item' : 'Create Item'}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}