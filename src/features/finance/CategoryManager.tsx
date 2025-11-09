import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FinancialCategory, CategoryInsert } from '@/types/finance';
import { Plus, Trash2, Edit } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryManagerProps {
  categories: FinancialCategory[];
  onCreate: (data: CategoryInsert) => Promise<void>;
  onUpdate: (id: string, data: CategoryInsert) => Promise<void>;
  onDelete: (id: string) => void;
}

export function CategoryManager({ categories, onCreate, onUpdate, onDelete }: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
    },
  });

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      const categoryData: CategoryInsert = {
        name: values.name,
        type: values.type,
      };
      
      if (editingId) {
        await onUpdate(editingId, categoryData);
        setEditingId(null);
      } else {
        await onCreate(categoryData);
        setIsCreating(false);
      }
      form.reset();
    } catch (error) {
      console.error('Failed to submit category:', error);
    }
  };

  const handleEdit = (category: FinancialCategory) => {
    setEditingId(category.id);
    setIsCreating(true);
    form.reset({
      name: category.name,
      type: category.type,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    form.reset();
  };

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left Column: Add Category Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Category' : 'Add Category'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Egg Sales" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {editingId ? 'Update' : 'Add'} Category
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Right Column: Your Categories */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Expense Categories */}
            <div>
              <h3 className="font-semibold mb-3 text-destructive">Expenses</h3>
              {expenseCategories.length === 0 ? (
                <p className="text-muted-foreground text-sm">No expense categories yet.</p>
              ) : (
                <div className="space-y-2">
                  {expenseCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-md border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="outline">Expense</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(category.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Income Categories */}
            <div>
              <h3 className="font-semibold mb-3 text-green-600 dark:text-green-400">Income</h3>
              {incomeCategories.length === 0 ? (
                <p className="text-muted-foreground text-sm">No income categories yet.</p>
              ) : (
                <div className="space-y-2">
                  {incomeCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-md border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="secondary">Income</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(category.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
