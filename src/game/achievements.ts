import { supabase } from '@/integrations/supabase/client';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_threshold?: number;
  action_type?: string;
  action_count?: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

// Predefined achievements
export const ACHIEVEMENTS: Achievement[] = [
  // XP-based achievements
  { id: 'first_steps', name: 'First Steps', description: 'Earn your first XP', icon: '🌱', xp_threshold: 1, tier: 'bronze' },
  { id: 'getting_started', name: 'Getting Started', description: 'Reach 100 XP', icon: '🚀', xp_threshold: 100, tier: 'bronze' },
  { id: 'growing_strong', name: 'Growing Strong', description: 'Reach 500 XP', icon: '💪', xp_threshold: 500, tier: 'silver' },
  { id: 'homestead_pro', name: 'Homestead Pro', description: 'Reach 1000 XP', icon: '🏆', xp_threshold: 1000, tier: 'gold' },
  { id: 'master_homesteader', name: 'Master Homesteader', description: 'Reach 5000 XP', icon: '👑', xp_threshold: 5000, tier: 'platinum' },
  
  // Action-based achievements
  { id: 'task_starter', name: 'Task Starter', description: 'Complete your first task', icon: '✅', action_type: 'task_completed', action_count: 1, tier: 'bronze' },
  { id: 'task_master', name: 'Task Master', description: 'Complete 10 tasks', icon: '📋', action_type: 'task_completed', action_count: 10, tier: 'silver' },
  { id: 'task_champion', name: 'Task Champion', description: 'Complete 50 tasks', icon: '🎯', action_type: 'task_completed', action_count: 50, tier: 'gold' },
  
  { id: 'journal_writer', name: 'Journal Writer', description: 'Write your first journal entry', icon: '📝', action_type: 'journal_created', action_count: 1, tier: 'bronze' },
  { id: 'storyteller', name: 'Storyteller', description: 'Write 10 journal entries', icon: '📖', action_type: 'journal_created', action_count: 10, tier: 'silver' },
  { id: 'chronicler', name: 'Chronicler', description: 'Write 50 journal entries', icon: '📚', action_type: 'journal_created', action_count: 50, tier: 'gold' },
  
  { id: 'animal_caretaker', name: 'Animal Caretaker', description: 'Add your first animal', icon: '🐾', action_type: 'animal_added', action_count: 1, tier: 'bronze' },
  { id: 'animal_lover', name: 'Animal Lover', description: 'Add 5 animals', icon: '🦆', action_type: 'animal_added', action_count: 5, tier: 'silver' },
  { id: 'animal_whisperer', name: 'Animal Whisperer', description: 'Add 20 animals', icon: '🐴', action_type: 'animal_added', action_count: 20, tier: 'gold' },
  
  { id: 'green_thumb', name: 'Green Thumb', description: 'Create your first crop rotation', icon: '🌿', action_type: 'crop_rotation_created', action_count: 1, tier: 'bronze' },
  { id: 'farmer', name: 'Farmer', description: 'Create 5 crop rotations', icon: '🌾', action_type: 'crop_rotation_created', action_count: 5, tier: 'silver' },
  
  { id: 'builder', name: 'Builder', description: 'Create your first infrastructure project', icon: '🔨', action_type: 'infrastructure_created', action_count: 1, tier: 'bronze' },
  { id: 'architect', name: 'Architect', description: 'Create 5 infrastructure projects', icon: '🏗️', action_type: 'infrastructure_created', action_count: 5, tier: 'silver' },
  
  { id: 'goal_setter', name: 'Goal Setter', description: 'Set your first goal', icon: '🎯', action_type: 'goal_created', action_count: 1, tier: 'bronze' },
  { id: 'ambitious', name: 'Ambitious', description: 'Set 10 goals', icon: '🌟', action_type: 'goal_created', action_count: 10, tier: 'silver' },
  
  { id: 'breeder', name: 'Breeder', description: 'Log your first breeding event', icon: '💕', action_type: 'breeding_event_created', action_count: 1, tier: 'bronze' },
  
  { id: 'organized', name: 'Organized', description: 'Add your first inventory item', icon: '📦', action_type: 'inventory_added', action_count: 1, tier: 'bronze' },
  { id: 'inventory_master', name: 'Inventory Master', description: 'Add 20 inventory items', icon: '🗃️', action_type: 'inventory_added', action_count: 20, tier: 'silver' },
  
  { id: 'accountant', name: 'Accountant', description: 'Log your first transaction', icon: '💰', action_type: 'transaction_created', action_count: 1, tier: 'bronze' },
  { id: 'bookkeeper', name: 'Bookkeeper', description: 'Log 50 transactions', icon: '📊', action_type: 'transaction_created', action_count: 50, tier: 'silver' },
];

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch all achievements the user has unlocked
 */
export async function getUserAchievements(): Promise<UserAchievement[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await (supabase as any)
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('[Achievements] Error fetching user achievements:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Achievements] Exception fetching achievements:', error);
    return [];
  }
}

/**
 * Check and award achievements based on current user stats and action counts
 */
export async function checkAndAwardAchievements(
  totalXp: number,
  actionCounts: Record<string, number>
): Promise<Achievement[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    // Get already unlocked achievements
    const unlockedIds = new Set(
      (await getUserAchievements()).map(ua => ua.achievement_id)
    );

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) continue;

      let shouldUnlock = false;

      // Check XP threshold
      if (achievement.xp_threshold && totalXp >= achievement.xp_threshold) {
        shouldUnlock = true;
      }

      // Check action count
      if (achievement.action_type && achievement.action_count) {
        const count = actionCounts[achievement.action_type] || 0;
        if (count >= achievement.action_count) {
          shouldUnlock = true;
        }
      }

      if (shouldUnlock) {
        const { error } = await (supabase as any)
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
          });

        if (!error) {
          newlyUnlocked.push(achievement);
          console.log(`[Achievements] Unlocked: ${achievement.name}`);
        }
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('[Achievements] Exception checking achievements:', error);
    return [];
  }
}

/**
 * Get action counts from xp_events for the current user
 */
export async function getActionCounts(): Promise<Record<string, number>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return {};

    const { data, error } = await (supabase as any)
      .from('xp_events')
      .select('action')
      .eq('user_id', userId);

    if (error) {
      console.error('[Achievements] Error fetching action counts:', error);
      return {};
    }

    const counts: Record<string, number> = {};
    for (const event of data || []) {
      counts[event.action] = (counts[event.action] || 0) + 1;
    }

    return counts;
  } catch (error) {
    console.error('[Achievements] Exception fetching action counts:', error);
    return {};
  }
}

/**
 * Get the tier color for styling
 */
export function getTierColor(tier: Achievement['tier']): string {
  switch (tier) {
    case 'bronze': return 'hsl(30, 50%, 50%)';
    case 'silver': return 'hsl(0, 0%, 70%)';
    case 'gold': return 'hsl(45, 100%, 50%)';
    case 'platinum': return 'hsl(200, 80%, 70%)';
    default: return 'hsl(var(--muted-foreground))';
  }
}

export function getTierBgClass(tier: Achievement['tier']): string {
  switch (tier) {
    case 'bronze': return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700';
    case 'silver': return 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600';
    case 'gold': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
    case 'platinum': return 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700';
    default: return 'bg-muted border-border';
  }
}
