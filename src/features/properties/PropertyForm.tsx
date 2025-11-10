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
import { Property, PropertyInsert } from './api';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const propertySchema = z.object({
  name: z.string().trim().min(1, 'Property name is required').max(100, 'Name must be less than 100 characters'),
  size_acres: z.coerce.number().positive('Size must be positive'),
  location: z.string().trim().min(1, 'Location is required').max(200, 'Location must be less than 200 characters'),
  climate_zone: z.string().optional().or(z.literal('')),
  soil_type: z.string().optional().or(z.literal('')),
  soil_ph: z.coerce.number().min(0).max(14).optional().or(z.literal('')),
  sun_exposure: z.string().optional().or(z.literal('')),
  annual_rainfall: z.coerce.number().min(0).optional().or(z.literal('')),
  water_sources: z.string().trim().max(500, 'Water sources must be less than 500 characters').optional().or(z.literal('')),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: PropertyInsert) => Promise<void>;
  onCancel?: () => void;
}

export function PropertyForm({ property, onSubmit, onCancel }: PropertyFormProps) {
  const [waterSource, setWaterSource] = useState('');
  
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: property?.name || '',
      size_acres: property?.size_acres || 0,
      location: property?.location || '',
      climate_zone: property?.climate_zone || '',
      soil_type: property?.soil_type || '',
      soil_ph: property?.soil_ph || undefined,
      sun_exposure: property?.sun_exposure || '',
      annual_rainfall: property?.annual_rainfall || undefined,
      water_sources: property?.water_sources || '',
    },
  });

  const handleSubmit = async (values: PropertyFormValues) => {
    try {
      await onSubmit({
        name: values.name.trim(),
        size_acres: values.size_acres,
        location: values.location.trim(),
        climate_zone: values.climate_zone || null,
        soil_type: values.soil_type || null,
        soil_ph: values.soil_ph || null,
        sun_exposure: values.sun_exposure || null,
        annual_rainfall: values.annual_rainfall || null,
        water_sources: values.water_sources?.trim() || null,
      });
      if (!property) {
        form.reset();
        setWaterSource('');
      }
    } catch (error) {
      console.error('Failed to submit property:', error);
    }
  };

  const handleAddWaterSource = () => {
    if (!waterSource.trim()) return;
    
    const currentSources = form.getValues('water_sources');
    const newSources = currentSources 
      ? `${currentSources}, ${waterSource.trim()}`
      : waterSource.trim();
    
    form.setValue('water_sources', newSources);
    setWaterSource('');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Name *</FormLabel>
              <FormControl>
                <Input placeholder="My Homestead" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="size_acres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size (acres) *</FormLabel>
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
                <FormLabel>Location *</FormLabel>
                <FormControl>
                  <Input placeholder="City, State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="climate_zone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>USDA Hardiness Zone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-50 bg-background">
                    <SelectItem value="zone_3">Zone 3</SelectItem>
                    <SelectItem value="zone_4">Zone 4</SelectItem>
                    <SelectItem value="zone_5">Zone 5</SelectItem>
                    <SelectItem value="zone_6">Zone 6</SelectItem>
                    <SelectItem value="zone_7">Zone 7</SelectItem>
                    <SelectItem value="zone_8">Zone 8</SelectItem>
                    <SelectItem value="zone_9">Zone 9</SelectItem>
                    <SelectItem value="zone_10">Zone 10</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="soil_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Soil Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-50 bg-background">
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="loam">Loam</SelectItem>
                    <SelectItem value="silt">Silt</SelectItem>
                    <SelectItem value="rocky">Rocky</SelectItem>
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
            name="soil_ph"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soil pH</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="14" 
                    placeholder="7.0" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>0-14 scale</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sun_exposure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Sun Exposure</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exposure" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-50 bg-background">
                    <SelectItem value="full_sun">Full Sun</SelectItem>
                    <SelectItem value="partial_sun">Partial Sun</SelectItem>
                    <SelectItem value="partial_shade">Partial Shade</SelectItem>
                    <SelectItem value="full_shade">Full Shade</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="annual_rainfall"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Rainfall (inches)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  placeholder="40" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="water_sources"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Water Sources</FormLabel>
              <div className="space-y-2">
                <FormControl>
                  <Input 
                    placeholder="Well, pond, stream (comma separated)" 
                    {...field} 
                  />
                </FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add water source"
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddWaterSource();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddWaterSource}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <FormDescription>
                Add water sources one at a time or separate with commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Save Property
          </Button>
        </div>
      </form>
    </Form>
  );
}
