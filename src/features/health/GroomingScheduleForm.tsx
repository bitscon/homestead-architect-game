import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { GroomingSchedule, GroomingScheduleInsert } from './groomingApi';
import { Animal } from '@/features/animals/api';

const formSchema = z.object({
  animal_id: z.string().min(1, 'Animal is required'),
  grooming_type: z.string().min(1, 'Grooming type is required'),
  frequency_days: z.coerce.number().min(1, 'Frequency must be at least 1 day'),
  last_completed_date: z.string().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface GroomingScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: GroomingSchedule;
  animals: Animal[];
  onSubmit: (data: GroomingScheduleInsert) => Promise<void>;
}

const GROOMING_TYPES = [
  'Hoof Trimming',
  'Shearing',
  'Brushing',
  'Bathing',
  'Nail Trimming',
  'Teeth Cleaning',
  'Other',
];

export function GroomingScheduleForm({
  open,
  onOpenChange,
  schedule,
  animals,
  onSubmit,
}: GroomingScheduleFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      animal_id: '',
      grooming_type: '',
      frequency_days: 30,
      last_completed_date: '',
      is_active: true,
      notes: '',
    },
  });

  useEffect(() => {
    if (schedule) {
      form.reset({
        animal_id: schedule.animal_id,
        grooming_type: schedule.grooming_type,
        frequency_days: schedule.frequency_days,
        last_completed_date: schedule.last_completed_date || '',
        is_active: schedule.is_active,
        notes: schedule.notes || '',
      });
    } else {
      form.reset({
        animal_id: '',
        grooming_type: '',
        frequency_days: 30,
        last_completed_date: '',
        is_active: true,
        notes: '',
      });
    }
  }, [schedule, form]);

  const handleSubmit = async (data: FormData) => {
    await onSubmit({
      animal_id: data.animal_id,
      grooming_type: data.grooming_type,
      frequency_days: data.frequency_days,
      is_active: data.is_active,
      last_completed_date: data.last_completed_date || null,
      notes: data.notes || null,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {schedule ? 'Edit Grooming Schedule' : 'Add Grooming Schedule'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="animal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Animal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select animal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {animals.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.name} ({animal.type})
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
              name="grooming_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grooming Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GROOMING_TYPES.map((type) => (
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

            <FormField
              control={form.control}
              name="frequency_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency (days)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_completed_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Completed Date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Saving...'
                  : schedule
                  ? 'Update Schedule'
                  : 'Add Schedule'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
