import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { InventoryForm } from '@/features/inventory/InventoryForm';
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  InventoryItem,
  InventoryItemInsert,
  isLowStock,
} from '@/features/inventory/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard, EmptyState } from '@/components/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Package, AlertTriangle, XCircle, FolderOpen, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryManagement() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadInventory();
    }
  }, [user?.id]);

  const loadInventory = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getInventory(user.id);
      setItems(data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: InventoryItemInsert) => {
    if (!user?.id) return;

    try {
      if (editingItem) {
        // Update existing item
        const updated = await updateInventoryItem(editingItem.id, user.id, data);
        setItems(items.map((i) => (i.id === updated.id ? updated : i)));
        toast.success('Item updated successfully');
      } else {
        // Create new item
        const newItem = await createInventoryItem(user.id, data);
        setItems([newItem, ...items]);
        
        // TODO: Award XP for inventory item creation
        // awardXP('inventory_added', 10, { itemId: newItem.id }).catch((err) => {
        //   console.error('[InventoryManagement] Failed to award XP:', err);
        // });
        
        toast.success('Item added successfully');
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('[InventoryManagement] Failed to save item:', error);
      toast.error(editingItem ? 'Failed to update item' : 'Failed to add item');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteInventoryItem(id, user.id);
      setItems(items.filter((i) => i.id !== id));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('[InventoryManagement] Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Calculate stats
  const totalItems = items.length;
  const lowStockItems = items.filter(item => 
    item.reorder_point != null && 
    item.current_stock <= item.reorder_point && 
    item.current_stock > 0
  );
  const outOfStockItems = items.filter(item => item.current_stock <= 0);
  const categories = useMemo(() => {
    const uniqueCategories = new Set(items.map(item => item.category));
    return uniqueCategories.size;
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Track supplies, tools, and equipment across your homestead
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg border bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Items"
            value={totalItems}
            icon={Package}
            tone="neutral"
            description="In inventory"
          />
          <StatCard
            title="Low Stock"
            value={lowStockItems.length}
            icon={AlertTriangle}
            tone="amber"
            description="Need reordering"
          />
          <StatCard
            title="Out of Stock"
            value={outOfStockItems.length}
            icon={XCircle}
            tone="neutral"
            description="Urgent attention"
          />
          <StatCard
            title="Categories"
            value={categories}
            icon={FolderOpen}
            tone="blue"
            description="Item types"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Inventory Items Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="text-lg font-semibold">
              Inventory Items
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No inventory items yet"
                description="Start tracking your supplies and equipment"
                action={
                  <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const stockStatus = item.current_stock <= 0
                    ? 'out' 
                    : (item.reorder_point != null && item.current_stock <= item.reorder_point)
                    ? 'low' 
                    : 'good';
                  
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium">{item.name}</h3>
                          {stockStatus === 'out' && (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                          {stockStatus === 'low' && (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="capitalize">{item.category}</span>
                          <span className="font-semibold">
                            {item.current_stock} {item.unit}
                          </span>
                          <span>Reorder at: {item.reorder_point}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Alerts Card */}
        <Card>
          <CardHeader className="bg-amber-50 dark:bg-amber-950/20 border-b">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : [...outOfStockItems, ...lowStockItems].length === 0 ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="font-medium text-foreground">All items well-stocked!</p>
                  <p className="text-sm text-muted-foreground">No stock alerts at this time</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {outOfStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <Badge variant="destructive" className="text-xs">Out</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                    <p className="text-xs text-red-700 dark:text-red-400 font-semibold mt-1">
                      0 {item.unit} remaining
                    </p>
                  </div>
                ))}
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                        Low
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-1">
                      {item.current_stock} / {item.reorder_point} {item.unit}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Item Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) setEditingItem(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Item' : 'Add Item'}
            </DialogTitle>
          </DialogHeader>
          <InventoryForm
            item={editingItem || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingItem(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
