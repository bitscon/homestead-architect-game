import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  title: string;
  content: string;
  tags: string[] | null;
  image_urls: string[] | null;
  property_id: string | null;
  created_at?: string;
}

export interface JournalEntryInsert {
  user_id: string;
  date: string;
  title: string;
  content: string;
  tags?: string[] | null;
  image_urls?: string[] | null;
  property_id?: string | null;
}

export interface JournalEntryUpdate {
  date?: string;
  title?: string;
  content?: string;
  tags?: string[] | null;
  image_urls?: string[] | null;
  property_id?: string | null;
}

export const getJournalEntries = async (
  userId: string,
  propertyId?: string
): Promise<JournalEntry[]> => {
  let query = supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const createJournalEntry = async (
  data: JournalEntryInsert
): Promise<JournalEntry> => {
  const { data: entry, error } = await supabase
    .from('journal_entries')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return entry;
};

export const updateJournalEntry = async (
  id: string,
  data: JournalEntryUpdate
): Promise<JournalEntry> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to update a journal entry');
  }

  const { data: entry, error } = await supabase
    .from('journal_entries')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return entry;
};

export const deleteJournalEntry = async (id: string): Promise<void> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to delete a journal entry');
  }

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
};
