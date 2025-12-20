import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  due_date: string | null;
  property_id: string | null;
  created_at: string;
}

export interface TaskInsert {
  title: string;
  description?: string | null;
  category: string;
  status: string;
  due_date?: string | null;
  property_id?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  category?: string;
  status?: string;
  due_date?: string | null;
  property_id?: string | null;
}

export async function getTasks(userId: string, propertyId?: string) {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Task[];
}

export async function getTask(id: string, userId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as Task;
}

export async function createTask(userId: string, task: TaskInsert) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...task,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTask(id: string, userId: string, task: TaskUpdate) {
  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string, userId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}
