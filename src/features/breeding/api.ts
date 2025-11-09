import { supabase } from '@/integrations/supabase/client';

export type BreedingEventType = 'heat_cycle' | 'breeding' | 'pregnancy_confirmation' | 'birth';

export interface BreedingEvent {
  id: string;
  user_id: string;
  animal_id: string;
  event_type: BreedingEventType;
  date: string;
  partner_animal_id?: string | null;
  partner_name?: string | null;
  expected_due_date?: string | null;
  actual_birth_date?: string | null;
  offspring_count?: number | null;
  notes?: string | null;
  property_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const getBreedingEvents = async (userId: string): Promise<BreedingEvent[]> => {
  const { data, error } = await (supabase as any)
    .from('breeding_events')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createBreedingEvent = async (event: Partial<BreedingEvent>): Promise<BreedingEvent> => {
  const { data, error } = await (supabase as any)
    .from('breeding_events')
    .insert([event])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateBreedingEvent = async (id: string, event: Partial<BreedingEvent>): Promise<BreedingEvent> => {
  const { data, error } = await (supabase as any)
    .from('breeding_events')
    .update(event)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteBreedingEvent = async (id: string): Promise<void> => {
  const { error } = await (supabase as any)
    .from('breeding_events')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
