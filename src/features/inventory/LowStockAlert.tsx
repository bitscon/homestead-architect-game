import { InventoryItem, isLowStock } from './api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LowStockAlertProps {
  items: InventoryItem[];
  onSelectItem?: (item: InventoryItem) => void;
}

export function LowStockAlert({ items, onSelectItem }: LowStockAlertProps) {
  const lowStockItems = items.filter(isLowStock);

  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Low Stock Alert</AlertTitle>
      <AlertDescription>
        <p className="mb-3">
          {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} need{lowStockItems.length === 1 ? 's' : ''} reordering:
        </p>
        <div className="space-y-2">
          {lowStockItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2 rounded-md bg-background/50 ${
                onSelectItem ? 'cursor-pointer hover:bg-background/80' : ''
              }`}
              onClick={() => onSelectItem?.(item)}
            >
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground">{item.name}</span>
                <Badge variant="outline">{item.category}</Badge>
              </div>
              <div className="text-sm">
                <span className="font-medium">{item.current_stock}</span>
                <span className="text-muted-foreground"> / {item.reorder_point} {item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
