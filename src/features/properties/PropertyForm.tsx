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
} from '@/components/ui/form';
import { Property, PropertyInsert } from './api';

const propertySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  size_acres: z.coerce.number().positive('Size must be positive'),
  location: z.string().min(1, 'Location is required').max(200),
  climate_zone: z.string().max(100).optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: PropertyInsert) => Promise<void>;
  onCancel?: () => void;
}

export function PropertyForm({ property, onSubmit, onCancel }: PropertyFormProps) {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: property?.name || '',
      size_acres: property?.size_acres || 0,
      location: property?.location || '',
      climate_zone: property?.climate_zone || '',
    },
  });

  const handleSubmit = async (values: PropertyFormValues) => {
    try {
      await onSubmit({
        name: values.name,
        size_acres: values.size_acres,
        location: values.location,
        climate_zone: values.climate_zone || null,
      });
      if (!property) {
        form.reset();
      }
    } catch (error) {
      console.error('Failed to submit property:', error);
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
              <FormLabel>Property Name</FormLabel>
              <FormControl>
                <Input placeholder="My Homestead" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="size_acres"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size (Acres)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="5.0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="City, State/Country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="climate_zone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Climate Zone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Zone 6a" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {property ? 'Update Property' : 'Create Property'}
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
