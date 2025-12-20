import { Target, Trophy, Archive } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { HomesteadGoal } from './api';

interface GoalListProps {
  goals: HomesteadGoal[];
  onSelectGoal: (goal: HomesteadGoal) => void;
  selectedGoal: HomesteadGoal | null;
}

export const GoalList = ({ goals, onSelectGoal, selectedGoal }: GoalListProps) => {
  const groupedGoals = {
    active: goals.filter((g) => g.status === 'active'),
    achieved: goals.filter((g) => g.status === 'achieved'),
    archived: goals.filter((g) => g.status === 'archived'),
  };

  const calculateProgress = (goal: HomesteadGoal, currentValue?: number) => {
    if (!goal.start_value || !goal.target_value) return 0;
    const value = currentValue ?? goal.start_value;
    const range = goal.target_value - goal.start_value;
    if (range === 0) return 100;
    const progress = ((value - goal.start_value) / range) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const renderGoalGroup = (
    title: string,
    icon: React.ReactNode,
    goals: HomesteadGoal[]
  ) => {
    if (goals.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-lg font-semibold text-foreground">
            {title} ({goals.length})
          </h3>
        </div>
        <div className="space-y-2">
          {goals.map((goal) => {
            const progress = calculateProgress(goal);
            const isSelected = selectedGoal?.id === goal.id;

            return (
              <Card
                key={goal.id}
                className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                  isSelected ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => onSelectGoal(goal)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">
                        {goal.title}
                      </h4>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    {goal.category && (
                      <Badge variant="secondary" className="shrink-0">
                        {goal.category}
                      </Badge>
                    )}
                  </div>

                  {goal.start_value !== null && goal.target_value !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {goal.start_value} → {goal.target_value}{' '}
                          {goal.target_metric || ''}
                        </span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  {goal.target_date && (
                    <p className="text-xs text-muted-foreground">
                      Target: {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {goals.length === 0 ? (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No goals yet. Create your first homestead goal!
          </p>
        </Card>
      ) : (
        <>
          {renderGoalGroup(
            'Active Goals',
            <Target className="h-5 w-5 text-primary" />,
            groupedGoals.active
          )}
          {renderGoalGroup(
            'Achieved Goals',
            <Trophy className="h-5 w-5 text-yellow-500" />,
            groupedGoals.achieved
          )}
          {renderGoalGroup(
            'Archived Goals',
            <Archive className="h-5 w-5 text-muted-foreground" />,
            groupedGoals.archived
          )}
        </>
      )}
    </div>
  );
};
