import { useEffect, useState } from 'react';
import { getUserStats } from '@/game/gameEngine';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';

interface XPStats {
  totalXp: number;
  level: number;
}

export const XPBar = () => {
  const [stats, setStats] = useState<XPStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(false);
      const data = await getUserStats();
      setStats(data);
    } catch (err) {
      console.error('[XPBar] Error fetching stats:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="w-full border-destructive/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">XP unavailable</p>
        </CardContent>
      </Card>
    );
  }

  const { totalXp, level } = stats;
  const nextLevelThreshold = level * 100;
  const currentLevelBase = (level - 1) * 100;
  const progressInCurrentLevel = totalXp - currentLevelBase;
  const progressPercent = Math.min(Math.max((progressInCurrentLevel / 100) * 100, 0), 100);

  return (
    <Card className="w-full bg-gradient-to-br from-card to-accent/5 border-accent/20 shadow-soft">
      <CardContent className="pt-6 pb-5">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Level {level}</div>
                <div className="text-xs text-muted-foreground">{totalXp.toLocaleString()} XP total</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Next level</div>
              <div className="text-sm font-medium text-foreground">{nextLevelThreshold.toLocaleString()} XP</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progressInCurrentLevel} / 100 XP</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
