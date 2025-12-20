import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface GroomingSchedule {
  id: string;
  user_id: string;
  animal_id: string;
  grooming_type: string;
  frequency_days: number;
  last_completed_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at?: string;
}

export interface GroomingScheduleInsert {
  animal_id: string;
  grooming_type: string;
  frequency_days: number;
  last_completed_date?: string | null;
  is_active?: boolean;
  notes?: string | null;
}

export interface GroomingScheduleUpdate {
  animal_id?: string;
  grooming_type?: string;
  frequency_days?: number;
  last_completed_date?: string | null;
  is_active?: boolean;
  notes?: string | null;
}

export interface GroomingRecord {
  id: string;
  user_id: string;
  animal_id: string;
  grooming_type: string;
  date: string;
  notes: string | null;
  created_at?: string;
}

export interface GroomingRecordInsert {
  animal_id: string;
  grooming_type: string;
  date: string;
  notes?: string | null;
}

// Grooming Schedules
export async function getGroomingSchedules(userId: string) {
  const { data, error } = await supabase
    .from('grooming_schedules')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as GroomingSchedule[];
}

export async function createGroomingSchedule(userId: string, schedule: GroomingScheduleInsert) {
  const { data, error } = await supabase
    .from('grooming_schedules')
    .insert({
      ...schedule,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as GroomingSchedule;
}

export async function updateGroomingSchedule(id: string, userId: string, schedule: GroomingScheduleUpdate) {
  const { data, error } = await supabase
    .from('grooming_schedules')
    .update(schedule)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as GroomingSchedule;
}

export async function deleteGroomingSchedule(id: string, userId: string) {
  const { error } = await supabase
    .from('grooming_schedules')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

// Grooming Records
export async function getGroomingRecords(userId: string) {
  const { data, error } = await supabase
    .from('grooming_records')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data as GroomingRecord[];
}

export async function createGroomingRecord(userId: string, record: GroomingRecordInsert) {
  const { data, error } = await supabase
    .from('grooming_records')
    .insert({
      ...record,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as GroomingRecord;
}
