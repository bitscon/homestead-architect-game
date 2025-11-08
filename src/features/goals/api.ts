import { supabase } from '@/integrations/supabase/client';

export interface HomesteadGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_metric: string | null;
  start_value: number | null;
  target_value: number | null;
  target_date: string | null;
  status: 'active' | 'achieved' | 'archived';
  created_at?: string;
}

export interface GoalInsert {
  user_id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  target_metric?: string | null;
  start_value?: number | null;
  target_value?: number | null;
  target_date?: string | null;
  status?: 'active' | 'achieved' | 'archived';
}

export interface GoalUpdate {
  title?: string;
  description?: string | null;
  category?: string | null;
  target_metric?: string | null;
  start_value?: number | null;
  target_value?: number | null;
  target_date?: string | null;
  status?: 'active' | 'achieved' | 'archived';
}

export interface GoalUpdateEntry {
  id: string;
  user_id: string;
  goal_id: string;
  date: string;
  current_value: number;
  notes: string | null;
  created_at?: string;
}

export interface GoalUpdateInsert {
  user_id: string;
  goal_id: string;
  date: string;
  current_value: number;
  notes?: string | null;
}

export const getGoals = async (userId: string): Promise<HomesteadGoal[]> => {
  const { data, error } = await (supabase as any)
    .from('homestead_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createGoal = async (data: GoalInsert): Promise<HomesteadGoal> => {
  const { data: goal, error } = await (supabase as any)
    .from('homestead_goals')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return goal;
};

export const updateGoal = async (
  id: string,
  data: GoalUpdate
): Promise<HomesteadGoal> => {
  const { data: goal, error } = await (supabase as any)
    .from('homestead_goals')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return goal;
};

export const deleteGoal = async (id: string): Promise<void> => {
  const { error } = await (supabase as any)
    .from('homestead_goals')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getGoalUpdates = async (
  goalId: string,
  userId: string
): Promise<GoalUpdateEntry[]> => {
  const { data, error } = await (supabase as any)
    .from('goal_updates')
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createGoalUpdate = async (
  data: GoalUpdateInsert
): Promise<GoalUpdateEntry> => {
  const { data: update, error } = await (supabase as any)
    .from('goal_updates')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return update;
};
