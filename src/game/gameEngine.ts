import { supabase } from '@/integrations/supabase/client';

/**
 * Computes the level based on total XP.
 * Formula: level = floor(total_xp / 100) + 1
 */
function computeLevel(totalXp: number): number {
  return Math.floor(totalXp / 100) + 1;
}

/**
 * Gets the current logged-in user's ID.
 * Returns null if no user is logged in.
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('[GameEngine] Error getting user:', error);
      return null;
    }
    return user?.id ?? null;
  } catch (error) {
    console.error('[GameEngine] Exception getting user:', error);
    return null;
  }
}

/**
 * Awards XP to the current user for a specific action.
 * Inserts an event into xp_events and updates user_stats.
 * 
 * @param action - The action performed (e.g., "task_completed", "journal_entry")
 * @param xp - The amount of XP to award
 * @param metadata - Optional additional data about the action
 */
export async function awardXP(
  action: string,
  xp: number,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('[GameEngine] No user logged in, skipping XP award');
      return;
    }

    // Insert XP event
    const { error: eventError } = await (supabase as any)
      .from('xp_events')
      .insert({
        user_id: userId,
        action,
        xp,
        metadata: metadata ?? null,
      });

    if (eventError) {
      console.error('[GameEngine] Error inserting xp_event:', eventError);
      return;
    }

    // Fetch current user stats
    const { data: currentStats, error: fetchError } = await (supabase as any)
      .from('user_stats')
      .select('total_xp')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[GameEngine] Error fetching user_stats:', fetchError);
      return;
    }

    // Calculate new total XP and level
    const newTotalXp = (currentStats?.total_xp ?? 0) + xp;
    const newLevel = computeLevel(newTotalXp);

    // Upsert user stats
    const { error: upsertError } = await (supabase as any)
      .from('user_stats')
      .upsert({
        user_id: userId,
        total_xp: newTotalXp,
        level: newLevel,
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('[GameEngine] Error upserting user_stats:', upsertError);
      return;
    }

    console.log(`[GameEngine] Awarded ${xp} XP for "${action}". Total: ${newTotalXp} XP, Level: ${newLevel}`);
  } catch (error) {
    console.error('[GameEngine] Exception in awardXP:', error);
  }
}

/**
 * Fetches the current user's stats (total XP and level).
 * Returns default values if no user is logged in or no stats exist.
 */
export async function getUserStats(): Promise<{ totalXp: number; level: number }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { totalXp: 0, level: 1 };
    }

    const { data, error } = await (supabase as any)
      .from('user_stats')
      .select('total_xp, level')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[GameEngine] Error fetching user_stats:', error);
      return { totalXp: 0, level: 1 };
    }

    if (!data) {
      return { totalXp: 0, level: 1 };
    }

    return {
      totalXp: data.total_xp,
      level: data.level,
    };
  } catch (error) {
    console.error('[GameEngine] Exception in getUserStats:', error);
    return { totalXp: 0, level: 1 };
  }
}
