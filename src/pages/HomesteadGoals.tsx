import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Plus, TrendingUp, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { GoalForm } from '@/features/goals/GoalForm';
import { GoalList } from '@/features/goals/GoalList';
import { GoalUpdateModal } from '@/features/goals/GoalUpdateModal';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalUpdates,
  createGoalUpdate,
  type HomesteadGoal,
  type GoalUpdateEntry,
} from '@/features/goals/api';

const HomesteadGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGoal, setSelectedGoal] = useState<HomesteadGoal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['homestead-goals', user?.id],
    queryFn: () => getGoals(user!.id),
    enabled: !!user,
  });

  const { data: updates = [] } = useQuery({
    queryKey: ['goal-updates', selectedGoal?.id, user?.id],
    queryFn: () => getGoalUpdates(selectedGoal!.id, user!.id),
    enabled: !!selectedGoal && !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      createGoal({
        ...data,
        user_id: user!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homestead-goals'] });
      toast({
        title: 'Success',
        description: 'Goal created successfully',
      });
      setShowForm(false);
      setSelectedGoal(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homestead-goals'] });
      toast({
        title: 'Success',
        description: 'Goal updated successfully',
      });
      setShowForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homestead-goals'] });
      toast({
        title: 'Success',
        description: 'Goal deleted successfully',
      });
      setSelectedGoal(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const createUpdateMutation = useMutation({
    mutationFn: (data: any) =>
      createGoalUpdate({
        ...data,
        goal_id: selectedGoal!.id,
        user_id: user!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-updates'] });
      toast({
        title: 'Success',
        description: 'Progress update added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: any) => {
    if (selectedGoal && showForm) {
      updateMutation.mutate({ id: selectedGoal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleNewGoal = () => {
    setSelectedGoal(null);
    setShowForm(true);
  };

  const handleEditGoal = () => {
    if (selectedGoal) {
      setShowForm(true);
    }
  };

  const handleSelectGoal = (goal: HomesteadGoal) => {
    setSelectedGoal(goal);
    setShowForm(false);
  };

  const calculateProgress = (goal: HomesteadGoal, updates: GoalUpdateEntry[]) => {
    if (!goal.start_value || !goal.target_value) return 0;
    const latestUpdate = updates[0];
    const currentValue = latestUpdate?.current_value ?? goal.start_value;
    const range = goal.target_value - goal.start_value;
    if (range === 0) return 100;
    const progress = ((currentValue - goal.start_value) / range) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const progress = selectedGoal ? calculateProgress(selectedGoal, updates) : 0;
  const latestUpdate = updates[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Homestead Goals
          </h1>
        </div>
        <Button onClick={handleNewGoal}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Goals</h2>
          <GoalList
            goals={goals}
            onSelectGoal={handleSelectGoal}
            selectedGoal={selectedGoal}
          />
        </div>

        <div className="lg:sticky lg:top-24 h-fit space-y-6">
          {showForm ? (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {selectedGoal ? 'Edit Goal' : 'New Goal'}
              </h2>
              <GoalForm
                goal={selectedGoal}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
              />
            </Card>
          ) : selectedGoal ? (
            <>
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {selectedGoal.title}
                    </h2>
                    {selectedGoal.description && (
                      <p className="text-muted-foreground">
                        {selectedGoal.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={handleEditGoal}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (
                          window.confirm(
                            'Are you sure you want to delete this goal?'
                          )
                        ) {
                          deleteMutation.mutate(selectedGoal.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {selectedGoal.start_value !== null &&
                  selectedGoal.target_value !== null && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {latestUpdate?.current_value ?? selectedGoal.start_value} /{' '}
                          {selectedGoal.target_value} {selectedGoal.target_metric}
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      <p className="text-sm text-muted-foreground text-right">
                        {Math.round(progress)}% Complete
                      </p>
                    </div>
                  )}

                <Button
                  className="w-full"
                  onClick={() => setShowUpdateModal(true)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Add Progress Update
                </Button>
              </Card>

              {updates.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Progress History
                  </h3>
                  <div className="space-y-4">
                    {updates.map((update) => (
                      <div
                        key={update.id}
                        className="border-l-2 border-primary pl-4 py-2"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-foreground">
                            {update.current_value} {selectedGoal.target_metric}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(update.date), 'PPP')}
                          </span>
                        </div>
                        {update.notes && (
                          <p className="text-sm text-muted-foreground">
                            {update.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Select a goal to view details or create a new one
              </p>
              <Button onClick={handleNewGoal}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Goal
              </Button>
            </Card>
          )}
        </div>
      </div>

      <GoalUpdateModal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={(data) => createUpdateMutation.mutate(data)}
        goalTitle={selectedGoal?.title || ''}
      />
    </div>
  );
};

export default HomesteadGoals;
