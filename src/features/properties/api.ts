import { supabase } from '@/integrations/supabase/client';

export interface Property {
  id: string;
  user_id: string;
  name: string;
  size_acres: number;
  location: string;
  climate_zone?: string | null;
  created_at: string;
}

export interface PropertyInsert {
  name: string;
  size_acres: number;
  location: string;
  climate_zone?: string | null;
}

export interface PropertyUpdate {
  name?: string;
  size_acres?: number;
  location?: string;
  climate_zone?: string | null;
}

export async function getProperties(userId: string) {
  const { data, error } = await (supabase as any)
    .from('properties')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Property[];
}

export async function getProperty(id: string, userId: string) {
  const { data, error } = await (supabase as any)
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as Property;
}

export async function createProperty(userId: string, property: PropertyInsert) {
  const { data, error } = await (supabase as any)
    .from('properties')
    .insert({
      ...property,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Property;
}

export async function updateProperty(id: string, userId: string, property: PropertyUpdate) {
  const { data, error } = await (supabase as any)
    .from('properties')
    .update(property)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Property;
}

export async function deleteProperty(id: string, userId: string) {
  const { error } = await (supabase as any)
    .from('properties')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}
