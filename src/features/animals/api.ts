import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface Animal {
  id: string;
  user_id: string;
  name: string;
  type: string;
  breed: string | null;
  birth_date: string | null;
  weight_lbs: number | null;
  gender: string | null;
  breeding_status: string | null;
  notes: string | null;
  property_id: string | null;
  photo_url?: string | null;
  created_at?: string;
}

export interface AnimalInsert {
  name: string;
  type: string;
  breed?: string | null;
  birth_date?: string | null;
  weight_lbs?: number | null;
  gender?: string | null;
  breeding_status?: string | null;
  notes?: string | null;
  property_id?: string | null;
  photo_url?: string | null;
}

export interface AnimalUpdate {
  name?: string;
  type?: string;
  breed?: string | null;
  birth_date?: string | null;
  weight_lbs?: number | null;
  gender?: string | null;
  breeding_status?: string | null;
  notes?: string | null;
  property_id?: string | null;
  photo_url?: string | null;
}

export async function getAnimals(userId: string, propertyId?: string) {
  let query = supabase
    .from('animals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Animal[];
}

export async function getAnimal(id: string, userId: string) {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as Animal;
}

export async function createAnimal(userId: string, animal: AnimalInsert) {
  const { data, error } = await supabase
    .from('animals')
    .insert({
      ...animal,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Animal;
}

export async function updateAnimal(id: string, userId: string, animal: AnimalUpdate) {
  const { data, error } = await supabase
    .from('animals')
    .update(animal)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Animal;
}

export async function deleteAnimal(id: string, userId: string) {
  const { error } = await supabase
    .from('animals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}
