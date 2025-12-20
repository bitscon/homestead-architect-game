import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { BreedingEvent, BreedingEventType } from './api';

const formSchema = z.object({
  animal_id: z.string().min(1, 'Animal is required'),
  event_type: z.enum(['heat_cycle', 'breeding', 'pregnancy_confirmation', 'birth']),
  date: z.date({ required_error: 'Date is required' }),
  partner_animal_id: z.string().optional(),
  partner_name: z.string().optional(),
  expected_due_date: z.date().optional(),
  actual_birth_date: z.date().optional(),
  offspring_count: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BreedingFormProps {
  event?: BreedingEvent | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const BreedingForm = ({ event, onSubmit, onCancel }: BreedingFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      animal_id: event?.animal_id || '',
      event_type: event?.event_type || 'breeding',
      date: event?.date ? new Date(event.date) : new Date(),
      partner_animal_id: event?.partner_animal_id || '',
      partner_name: event?.partner_name || '',
      expected_due_date: event?.expected_due_date ? new Date(event.expected_due_date) : undefined,
      actual_birth_date: event?.actual_birth_date ? new Date(event.actual_birth_date) : undefined,
      offspring_count: event?.offspring_count?.toString() || '',
      notes: event?.notes || '',
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      date: data.date.toISOString().split('T')[0],
      expected_due_date: data.expected_due_date ? data.expected_due_date.toISOString().split('T')[0] : null,
      actual_birth_date: data.actual_birth_date ? data.actual_birth_date.toISOString().split('T')[0] : null,
      offspring_count: data.offspring_count ? parseInt(data.offspring_count) : null,
    });
  };

  const eventType = form.watch('event_type');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="event_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="heat_cycle">Heat Cycle</SelectItem>
                  <SelectItem value="breeding">Breeding</SelectItem>
                  <SelectItem value="pregnancy_confirmation">Pregnancy Confirmation</SelectItem>
                  <SelectItem value="birth">Birth</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="animal_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Animal ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter animal ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
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
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {(eventType === 'breeding' || eventType === 'pregnancy_confirmation' || eventType === 'birth') && (
          <>
            <FormField
              control={form.control}
              name="partner_animal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Animal ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter partner animal ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partner_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter partner name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {(eventType === 'breeding' || eventType === 'pregnancy_confirmation') && (
          <FormField
            control={form.control}
            name="expected_due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expected Due Date</FormLabel>
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
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {eventType === 'birth' && (
          <>
            <FormField
              control={form.control}
              name="actual_birth_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Actual Birth Date</FormLabel>
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
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="offspring_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offspring Count</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="Enter number of offspring" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter any additional notes" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {event ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
