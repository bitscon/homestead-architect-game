import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AchievementBadge } from './AchievementBadge';
import { 
  ACHIEVEMENTS, 
  getUserAchievements, 
  UserAchievement,
  Achievement 
} from '@/game/achievements';
import { Award, ChevronRight } from 'lucide-react';

interface AchievementsPanelProps {
  compact?: boolean;
}

export const AchievementsPanel = ({ compact = false }: AchievementsPanelProps) => {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setIsLoading(true);
      const data = await getUserAchievements();
      setUserAchievements(data);
    } catch (error) {
      console.error('[AchievementsPanel] Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));
  const unlockedMap = new Map(userAchievements.map(ua => [ua.achievement_id, ua]));

  // Group achievements by tier
  const groupedAchievements = ACHIEVEMENTS.reduce((acc, achievement) => {
    if (!acc[achievement.tier]) acc[achievement.tier] = [];
    acc[achievement.tier].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const tierOrder: Achievement['tier'][] = ['bronze', 'silver', 'gold', 'platinum'];
  const unlockedCount = userAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-14 w-14 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    // Show only unlocked achievements in compact mode
    const recentUnlocked = userAchievements.slice(0, 5);
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Achievements
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {unlockedCount}/{totalCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {unlockedCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              Complete actions to earn achievements!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recentUnlocked.map(ua => {
                const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievement_id);
                if (!achievement) return null;
                return (
                  <AchievementBadge
                    key={ua.id}
                    achievement={achievement}
                    unlocked={true}
                    unlockedAt={ua.unlocked_at}
                    size="sm"
                  />
                );
              })}
              {unlockedCount > 5 && (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  +{unlockedCount - 5}
                </div>
              )}
            </div>
          )}
          <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
            <Link to="/achievements" className="flex items-center justify-center gap-1">
              View All Achievements
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
          <Badge variant="outline">
            {unlockedCount} / {totalCount} Unlocked
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {tierOrder.map(tier => {
          const achievements = groupedAchievements[tier] || [];
          if (achievements.length === 0) return null;

          return (
            <div key={tier}>
              <h4 className="text-sm font-medium text-muted-foreground capitalize mb-3">
                {tier} Tier
              </h4>
              <div className="flex flex-wrap gap-3">
                {achievements.map(achievement => {
                  const isUnlocked = unlockedIds.has(achievement.id);
                  const userAchievement = unlockedMap.get(achievement.id);
                  
                  return (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={isUnlocked}
                      unlockedAt={userAchievement?.unlocked_at}
                      size="md"
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
