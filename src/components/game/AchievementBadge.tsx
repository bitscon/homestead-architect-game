import { Achievement, getTierBgClass } from '@/game/achievements';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AchievementBadge = ({ 
  achievement, 
  unlocked, 
  unlockedAt,
  size = 'md' 
}: AchievementBadgeProps) => {
  const sizeClasses = {
    sm: 'h-10 w-10 text-lg',
    md: 'h-14 w-14 text-2xl',
    lg: 'h-20 w-20 text-4xl',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'rounded-full border-2 flex items-center justify-center transition-all',
              sizeClasses[size],
              unlocked 
                ? getTierBgClass(achievement.tier)
                : 'bg-muted/50 border-muted-foreground/20 grayscale opacity-40'
            )}
          >
            <span className={cn(!unlocked && 'opacity-50')}>
              {achievement.icon}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
            {unlocked && unlockedAt && (
              <p className="text-xs text-green-600 dark:text-green-400">
                Unlocked {new Date(unlockedAt).toLocaleDateString()}
              </p>
            )}
            {!unlocked && (
              <p className="text-xs text-muted-foreground italic">Not yet unlocked</p>
            )}
            <p className="text-xs capitalize text-muted-foreground">
              {achievement.tier} tier
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
