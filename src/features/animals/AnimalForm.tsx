import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Animal, AnimalInsert } from './api';
import { Property } from '@/features/properties/api';

const animalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.string().min(1, 'Type is required'),
  breed: z.string().max(100).optional(),
  birth_date: z.date().optional(),
  weight_lbs: z.coerce.number().positive().optional(),
  gender: z.string().optional(),
  breeding_status: z.string().optional(),
  notes: z.string().max(2000).optional(),
  property_id: z.string().optional(),
});

type AnimalFormValues = z.infer<typeof animalSchema>;

interface AnimalFormProps {
  animal?: Animal;
  properties?: Property[];
  onSubmit: (data: AnimalInsert) => Promise<void>;
  onCancel?: () => void;
}

const ANIMAL_TYPES = [
  'Cattle',
  'Goat',
  'Sheep',
  'Pig',
  'Chicken',
  'Duck',
  'Horse',
  'Rabbit',
  'Bee',
  'Other',
];

const GENDERS = ['Male', 'Female', 'Unknown'];

const BREEDING_STATUSES = [
  'Not Breeding',
  'Breeding Ready',
  'Pregnant',
  'Nursing',
  'Retired',
];

export function AnimalForm({ animal, properties = [], onSubmit, onCancel }: AnimalFormProps) {
  const form = useForm<AnimalFormValues>({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      name: animal?.name || '',
      type: animal?.type || '',
      breed: animal?.breed || '',
      birth_date: animal?.birth_date ? new Date(animal.birth_date) : undefined,
      weight_lbs: animal?.weight_lbs || undefined,
      gender: animal?.gender || '',
      breeding_status: animal?.breeding_status || '',
      notes: animal?.notes || '',
      property_id: animal?.property_id || '',
    },
  });

  const handleSubmit = async (values: AnimalFormValues) => {
    try {
      await onSubmit({
        name: values.name,
        type: values.type,
        breed: values.breed || null,
        birth_date: values.birth_date ? format(values.birth_date, 'yyyy-MM-dd') : null,
        weight_lbs: values.weight_lbs || null,
        gender: values.gender || null,
        breeding_status: values.breeding_status || null,
        notes: values.notes || null,
        property_id: values.property_id || null,
      });
      if (!animal) {
        form.reset();
      }
    } catch (error) {
      console.error('Failed to submit animal:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Bessie" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select animal type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ANIMAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
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
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breed (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Holstein" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GENDERS.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
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
            name="birth_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Birth Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className={cn('p-3 pointer-events-auto')}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight_lbs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (lbs, Optional)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 1200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="breeding_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breeding Status (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select breeding status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BREEDING_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {properties.length > 0 && (
          <FormField
            control={form.control}
            name="property_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about this animal" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {animal ? 'Update Animal' : 'Add Animal'}
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
