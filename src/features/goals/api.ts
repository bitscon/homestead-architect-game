import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type HomesteadGoal = Database['public']['Tables']['homestead_goals']['Row'];
export type GoalInsert = Database['public']['Tables']['homestead_goals']['Insert'];
export type GoalUpdate = Database['public']['Tables']['homestead_goals']['Update'];

export type GoalUpdateEntry = Database['public']['Tables']['goal_updates']['Row'];
export type GoalUpdateInsert = Database['public']['Tables']['goal_updates']['Insert'];

export const getGoals = async (userId: string): Promise<HomesteadGoal[]> => {
  const { data, error } = await supabase
    .from('homestead_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createGoal = async (data: GoalInsert): Promise<HomesteadGoal> => {
  const { data: goal, error } = await supabase
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
  const { data: goal, error } = await supabase
    .from('homestead_goals')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return goal;
};

export const deleteGoal = async (id: string): Promise<void> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to delete a goal');
  }

  const { error } = await supabase
    .from('homestead_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
};

export const getGoalUpdates = async (
  goalId: string,
  userId: string
): Promise<GoalUpdateEntry[]> => {
  const { data, error } = await supabase
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
  const { data: update, error } = await supabase
    .from('goal_updates')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return update;
};
