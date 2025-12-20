import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { CropRotation } from '@/types/crops';

export type RotationPlan = CropRotation;

export interface CreateRotationPlanData {
  name: string;
  property_id?: string | null;
  plot_name: string;
  year: number;
  season: string;
  crop_name: string;
  plant_date?: string | null;
  harvest_date?: string | null;
  notes?: string | null;
}

export interface UpdateRotationPlanData {
  name?: string;
  property_id?: string | null;
  plot_name?: string;
  year?: number;
  season?: string;
  crop_name?: string;
  plant_date?: string | null;
  harvest_date?: string | null;
  notes?: string | null;
}

/**
 * Fetch all rotation plans for a specific user
 */
export const getRotationPlans = async (userId: string): Promise<RotationPlan[]> => {
  const { data, error } = await supabase
    .from('crop_rotations')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rotation plans:', error);
    throw error;
  }

  return (data ?? []) as RotationPlan[];
};

/**
 * Create a new rotation plan (automatically sets user_id to current user)
 */
export const createRotationPlan = async (
  data: CreateRotationPlanData
): Promise<RotationPlan> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create a rotation plan');
  }

  const { data: newPlan, error } = await supabase
    .from('crop_rotations')
    .insert({
      user_id: user.id,
      name: data.name,
      property_id: data.property_id || null,
      plot_name: data.plot_name,
      year: data.year,
      season: data.season,
      crop_name: data.crop_name,
      plant_date: data.plant_date || null,
      harvest_date: data.harvest_date || null,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating rotation plan:', error);
    throw error;
  }

  return newPlan as RotationPlan;
};

/**
 * Update an existing rotation plan
 */
export const updateRotationPlan = async (
  id: string,
  data: UpdateRotationPlanData
): Promise<RotationPlan> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to update a rotation plan');
  }

  const { data: updatedPlan, error } = await supabase
    .from('crop_rotations')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating rotation plan:', error);
    throw error;
  }

  return updatedPlan as RotationPlan;
};

/**
 * Delete a rotation plan
 */
export const deleteRotationPlan = async (id: string): Promise<void> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to delete a rotation plan');
  }

  const { error } = await supabase
    .from('crop_rotations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting rotation plan:', error);
    throw error;
  }
};
