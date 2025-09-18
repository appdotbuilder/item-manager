import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';
import type { Item } from '../../../server/src/schema';

interface DeleteItemDialogProps {
  item: Item | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteItemDialog({ item, onConfirm, onCancel, isLoading }: DeleteItemDialogProps) {
  if (!item) return null;

  return (
    <AlertDialog open={!!item} onOpenChange={() => !isLoading && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl text-gray-800">
              Delete Item?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600 pt-2">
            Are you sure you want to delete <strong>"{item.name}"</strong>? This action cannot be undone.
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-red-400">
              <div className="text-sm space-y-1">
                <div><strong>Name:</strong> {item.name}</div>
                <div><strong>Price:</strong> ${item.price.toFixed(2)}</div>
                <div><strong>Quantity:</strong> {item.quantity} units</div>
                <div><strong>Total Value:</strong> ${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onCancel}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 min-w-[100px]"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </div>
            ) : (
              <div className="flex items-center">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}