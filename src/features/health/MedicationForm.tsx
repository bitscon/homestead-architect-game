import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Medication, MedicationInsert } from './medicationsApi';

const medicationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  target_animals: z.string().trim().min(1, 'Target animals is required'),
  dosage_per_lb: z.string().optional(),
  dosage_unit: z.string().trim().max(50, 'Unit must be less than 50 characters').optional(),
  administration_method: z.string().trim().max(100, 'Method must be less than 100 characters').optional(),
  withdrawal_period_meat_days: z.string().optional(),
  withdrawal_period_milk_days: z.string().optional(),
  notes: z.string().trim().max(2000, 'Notes must be less than 2000 characters').optional(),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

interface MedicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication?: Medication;
  onSubmit: (data: MedicationInsert) => Promise<void>;
}

export function MedicationForm({ open, onOpenChange, medication, onSubmit }: MedicationFormProps) {
  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: medication?.name || '',
      target_animals: medication?.target_animals?.join(', ') || '',
      dosage_per_lb: medication?.dosage_per_lb?.toString() || '',
      dosage_unit: medication?.dosage_unit || '',
      administration_method: medication?.administration_method || '',
      withdrawal_period_meat_days: medication?.withdrawal_period_meat_days?.toString() || '',
      withdrawal_period_milk_days: medication?.withdrawal_period_milk_days?.toString() || '',
      notes: medication?.notes || '',
    },
  });

  const handleSubmit = async (data: MedicationFormValues) => {
    try {
      await onSubmit({
        name: data.name,
        target_animals: data.target_animals.split(',').map(s => s.trim()).filter(Boolean),
        dosage_per_lb: data.dosage_per_lb ? parseFloat(data.dosage_per_lb) : null,
        dosage_unit: data.dosage_unit || null,
        administration_method: data.administration_method || null,
        withdrawal_period_meat_days: data.withdrawal_period_meat_days ? parseInt(data.withdrawal_period_meat_days) : null,
        withdrawal_period_milk_days: data.withdrawal_period_milk_days ? parseInt(data.withdrawal_period_milk_days) : null,
        notes: data.notes || null,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit medication:', error);
      // Optionally: toast.error('Failed to save medication');
      throw error; // Re-throw for parent component handling
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{medication ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Penicillin, Ivermectin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_animals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Animals * (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cattle, Goats, Sheep" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dosage_per_lb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage per lb</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dosage_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ml, mg, cc" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="administration_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Administration Method</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Subcutaneous, Oral, Intramuscular" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="withdrawal_period_meat_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meat Withdrawal (days)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="withdrawal_period_milk_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milk Withdrawal (days)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional information, warnings, or instructions"
                      className="min-h-[100px]"
                      {...field}
                    />
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
                {form.formState.isSubmitting ? (
                  <>Updating...</>
                ) : (
                  <>{medication ? 'Update Medication' : 'Add Medication'}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
