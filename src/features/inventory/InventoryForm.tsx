import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { InventoryItem, InventoryItemInsert } from './api';

const inventorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  category: z.string().trim().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
  current_stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  unit: z.string().trim().min(1, 'Unit is required').max(50, 'Unit must be less than 50 characters'),
  reorder_point: z.coerce.number().min(0, 'Reorder point cannot be negative'),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  item?: InventoryItem;
  onSubmit: (data: InventoryItemInsert) => Promise<void>;
  onCancel?: () => void;
}

const CATEGORIES = [
  'Feed',
  'Tools',
  'Seeds',
  'Fertilizer',
  'Medications',
  'Equipment Parts',
  'Cleaning Supplies',
  'Building Materials',
  'Other',
];

const UNITS = [
  'lbs',
  'kg',
  'bags',
  'gallons',
  'liters',
  'pieces',
  'boxes',
  'bales',
  'units',
];

export function InventoryForm({ item, onSubmit, onCancel }: InventoryFormProps) {
  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: item?.name || '',
      category: item?.category || '',
      current_stock: item?.current_stock || 0,
      unit: item?.unit || '',
      reorder_point: item?.reorder_point || 0,
    },
  });

  const handleSubmit = async (values: InventoryFormValues) => {
    try {
      await onSubmit({
        name: values.name.trim(),
        category: values.category.trim(),
        current_stock: values.current_stock,
        unit: values.unit.trim(),
        reorder_point: values.reorder_point,
      });
      if (!item) {
        form.reset();
      }
    } catch (error) {
      console.error('Failed to submit inventory item:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chicken Feed" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-50 bg-background">
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-50 bg-background">
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="current_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Stock</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reorder_point"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Point</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0" {...field} />
                </FormControl>
                <FormDescription>Alert when stock falls below this level</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {item ? 'Update Item' : 'Add Item'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
