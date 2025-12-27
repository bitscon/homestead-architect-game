import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_xp: number;
  level: number;
  rank: number;
}

export interface UserPrivacySettings {
  user_id: string;
  show_on_leaderboard: boolean;
  display_name: string;
}

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
 * Get the public leaderboard (users who have opted in)
 */
export async function getLeaderboard(limit: number = 20): Promise<LeaderboardEntry[]> {
  try {
    // First get users who opted into the leaderboard
    const { data: privacyData, error: privacyError } = await supabase
      .from('user_privacy_settings')
      .select('user_id, display_name')
      .eq('show_on_leaderboard', true);

    if (privacyError) {
      console.error('[Leaderboard] Error fetching privacy settings:', privacyError);
      return [];
    }

    if (!privacyData || privacyData.length === 0) {
      return [];
    }

    interface PrivacyRow {
      user_id: string;
      display_name: string;
    }
    const userIds = privacyData.map((p: PrivacyRow) => p.user_id);
    const displayNameMap = new Map(privacyData.map((p: PrivacyRow) => [p.user_id, p.display_name]));

    // Get stats for opted-in users
    const { data: statsData, error: statsError } = await supabase
      .from('user_stats')
      .select('user_id, total_xp, level')
      .in('user_id', userIds)
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (statsError) {
      console.error('[Leaderboard] Error fetching user stats:', statsError);
      return [];
    }

    interface StatRow {
      user_id: string;
      total_xp: number;
      level: number;
    }
    return (statsData || []).map((stat: StatRow, index: number) => ({
      user_id: stat.user_id,
      display_name: displayNameMap.get(stat.user_id) || 'Anonymous Homesteader',
      total_xp: stat.total_xp,
      level: stat.level,
      rank: index + 1,
    }));
  } catch (error) {
    console.error('[Leaderboard] Exception fetching leaderboard:', error);
    return [];
  }
}

/**
 * Get current user's privacy settings
 */
export async function getUserPrivacySettings(): Promise<UserPrivacySettings | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('user_privacy_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Leaderboard] Error fetching privacy settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[Leaderboard] Exception fetching privacy settings:', error);
    return null;
  }
}

/**
 * Update user's privacy settings
 */
export async function updateUserPrivacySettings(
  showOnLeaderboard: boolean,
  displayName: string
): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabase
      .from('user_privacy_settings')
      .upsert({
        user_id: userId,
        show_on_leaderboard: showOnLeaderboard,
        display_name: displayName,
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('[Leaderboard] Error updating privacy settings:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Leaderboard] Exception updating privacy settings:', error);
    return false;
  }
}

/**
 * Get the current user's rank on the leaderboard
 */
export async function getUserRank(): Promise<number | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    // Get all user stats ordered by XP
    const { data, error } = await supabase
      .from('user_stats')
      .select('user_id, total_xp')
      .order('total_xp', { ascending: false });

    if (error) {
      console.error('[Leaderboard] Error fetching ranks:', error);
      return null;
    }

    interface RankRow {
      user_id: string;
      total_xp: number;
    }
    const rank = (data || []).findIndex((s: RankRow) => s.user_id === userId) + 1;
    return rank > 0 ? rank : null;
  } catch (error) {
    console.error('[Leaderboard] Exception fetching rank:', error);
    return null;
  }
}
