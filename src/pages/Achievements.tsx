import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AchievementBadge } from '@/components/game/AchievementBadge';
import { XPBar } from '@/components/game/XPBar';
import {
  ACHIEVEMENTS,
  getUserAchievements,
  getActionCounts,
  UserAchievement,
  Achievement,
} from '@/game/achievements';
import { getUserStats } from '@/game/gameEngine';
import { Award, Target, TrendingUp, Trophy, Star } from 'lucide-react';

interface AchievementWithProgress extends Achievement {
  currentCount?: number;
  currentXp?: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
}

export default function Achievements() {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [actionCounts, setActionCounts] = useState<Record<string, number>>({});
  const [totalXp, setTotalXp] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [achievements, counts, stats] = await Promise.all([
        getUserAchievements(),
        getActionCounts(),
        getUserStats(),
      ]);
      setUserAchievements(achievements);
      setActionCounts(counts);
      setTotalXp(stats.totalXp);
    } catch (error) {
      console.error('[Achievements] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));
  const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievement_id, ua]));

  // Calculate progress for each achievement
  const achievementsWithProgress: AchievementWithProgress[] = ACHIEVEMENTS.map((achievement) => {
    const isUnlocked = unlockedIds.has(achievement.id);
    const userAchievement = unlockedMap.get(achievement.id);
    let progressPercent = isUnlocked ? 100 : 0;
    let currentCount: number | undefined;
    let currentXp: number | undefined;

    if (!isUnlocked) {
      if (achievement.xp_threshold) {
        currentXp = totalXp;
        progressPercent = Math.min(100, (totalXp / achievement.xp_threshold) * 100);
      } else if (achievement.action_type && achievement.action_count) {
        currentCount = actionCounts[achievement.action_type] || 0;
        progressPercent = Math.min(100, (currentCount / achievement.action_count) * 100);
      }
    }

    return {
      ...achievement,
      isUnlocked,
      unlockedAt: userAchievement?.unlocked_at,
      progressPercent,
      currentCount,
      currentXp,
    };
  });

  // Group by tier
  const groupedAchievements = achievementsWithProgress.reduce(
    (acc, achievement) => {
      if (!acc[achievement.tier]) acc[achievement.tier] = [];
      acc[achievement.tier].push(achievement);
      return acc;
    },
    {} as Record<string, AchievementWithProgress[]>
  );

  const tierOrder: Achievement['tier'][] = ['bronze', 'silver', 'gold', 'platinum'];
  const unlockedCount = userAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercent = Math.round((unlockedCount / totalCount) * 100);

  // Stats by tier
  const tierStats = tierOrder.map((tier) => {
    const tierAchievements = groupedAchievements[tier] || [];
    const tierUnlocked = tierAchievements.filter((a) => a.isUnlocked).length;
    return { tier, unlocked: tierUnlocked, total: tierAchievements.length };
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and unlock badges as you grow your homestead
          </p>
        </div>
        <div className="w-full md:w-64">
          <XPBar />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              Total Progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unlockedCount}/{totalCount}</div>
            <Progress value={completionPercent} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{completionPercent}% complete</p>
          </CardContent>
        </Card>

        {tierStats.map(({ tier, unlocked, total }) => {
          const tierIcons: Record<string, React.ReactNode> = {
            bronze: <Target className="h-4 w-4 text-orange-500" />,
            silver: <Star className="h-4 w-4 text-gray-400" />,
            gold: <Trophy className="h-4 w-4 text-yellow-500" />,
            platinum: <TrendingUp className="h-4 w-4 text-cyan-400" />,
          };

          return (
            <Card key={tier}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1 capitalize">
                  {tierIcons[tier]}
                  {tier} Tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unlocked}/{total}</div>
                <Progress
                  value={total > 0 ? (unlocked / total) * 100 : 0}
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Achievement Grid by Tier */}
      {tierOrder.map((tier) => {
        const achievements = groupedAchievements[tier] || [];
        if (achievements.length === 0) return null;

        const tierColors: Record<string, string> = {
          bronze: 'border-l-orange-500',
          silver: 'border-l-gray-400',
          gold: 'border-l-yellow-500',
          platinum: 'border-l-cyan-400',
        };

        return (
          <Card key={tier} className={`border-l-4 ${tierColors[tier]}`}>
            <CardHeader>
              <CardTitle className="capitalize flex items-center gap-2">
                {tier === 'bronze' && <Target className="h-5 w-5 text-orange-500" />}
                {tier === 'silver' && <Star className="h-5 w-5 text-gray-400" />}
                {tier === 'gold' && <Trophy className="h-5 w-5 text-yellow-500" />}
                {tier === 'platinum' && <TrendingUp className="h-5 w-5 text-cyan-400" />}
                {tier} Achievements
              </CardTitle>
              <CardDescription>
                {achievements.filter((a) => a.isUnlocked).length} of {achievements.length} unlocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border transition-all ${
                      achievement.isUnlocked
                        ? 'bg-accent/50 border-primary/30'
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AchievementBadge
                        achievement={achievement}
                        unlocked={achievement.isUnlocked}
                        unlockedAt={achievement.unlockedAt}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{achievement.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {achievement.description}
                        </p>
                        {!achievement.isUnlocked && (
                          <div className="mt-2">
                            <Progress value={achievement.progressPercent} className="h-1.5" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {achievement.xp_threshold && (
                                <>
                                  {achievement.currentXp || 0} / {achievement.xp_threshold} XP
                                </>
                              )}
                              {achievement.action_count && (
                                <>
                                  {achievement.currentCount || 0} / {achievement.action_count}
                                </>
                              )}
                            </p>
                          </div>
                        )}
                        {achievement.isUnlocked && achievement.unlockedAt && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
