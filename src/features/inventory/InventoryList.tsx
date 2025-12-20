import { InventoryItem, isLowStock } from './api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle } from 'lucide-react';

interface InventoryListProps {
  items: InventoryItem[];
  selectedId?: string;
  onSelect: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export function InventoryList({ items, selectedId, onSelect, onDelete }: InventoryListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No inventory items yet. Add your first item to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const lowStock = isLowStock(item);
        
        return (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all hover:shadow-soft ${
              selectedId === item.id ? 'ring-2 ring-primary' : ''
            } ${lowStock ? 'border-destructive' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1" onClick={() => onSelect(item)}>
                  <div className="flex items-start gap-2 mb-2">
                    <h3 className="font-semibold text-foreground flex-1">{item.name}</h3>
                    {lowStock && (
                      <Badge variant="destructive" className="inline-flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline" className="ml-2">
                        {item.category}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stock:</span>
                      <span className={`ml-2 font-medium ${lowStock ? 'text-destructive' : 'text-foreground'}`}>
                        {item.current_stock} {item.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reorder at:</span>
                      <span className="ml-2 text-foreground">{item.reorder_point} {item.unit}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="text-destructive hover:text-destructive ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
