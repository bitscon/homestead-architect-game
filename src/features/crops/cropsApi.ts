import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { Crop } from '@/types/crops';

export type CropOption = Crop;

/**
 * Fetch crops from Supabase crops table.
 * Returns null if table doesn't exist or fetch fails.
 */
export const fetchCropsFromDatabase = async (): Promise<CropOption[] | null> => {
  try {
    const { data, error } = await supabase
      .from('crops')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      console.log('Crops table not found or error fetching:', error.message);
      return null;
    }

    return (data ?? []) as CropOption[];
  } catch (err) {
    console.log('Error fetching crops:', err);
    return null;
  }
};

/**
 * Default crop options as fallback
 */
export const DEFAULT_CROP_OPTIONS: CropOption[] = [
  { id: 'basil', name: 'Basil' },
  { id: 'beans', name: 'Beans' },
  { id: 'carrots', name: 'Carrots' },
  { id: 'lettuce', name: 'Lettuce' },
  { id: 'pumpkins', name: 'Pumpkins' },
  { id: 'tomatoes', name: 'Tomatoes' },
];

/**
 * Get crop options - tries database first, falls back to defaults
 */
export const getCropOptions = async (): Promise<CropOption[]> => {
  const dbCrops = await fetchCropsFromDatabase();
  return dbCrops || DEFAULT_CROP_OPTIONS;
};
