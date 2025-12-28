import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TaskForm } from '@/features/tasks/TaskForm';
import { TaskList } from '@/features/tasks/TaskList';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  Task,
  TaskInsert,
} from '@/features/tasks/api';
import { getProperties, Property } from '@/features/properties/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { awardXP } from '@/game/gameEngine';

export default function SeasonalCalendar() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, selectedPropertyId]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [tasksData, propertiesData] = await Promise.all([
        getTasks(user.id, selectedPropertyId || undefined),
        getProperties(user.id),
      ]);
      setTasks(tasksData);
      setProperties(propertiesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: TaskInsert) => {
    if (!user?.id) return;

    try {
      const newTask = await createTask(user.id, data);
      setTasks([newTask, ...tasks]);
      setIsCreating(false);
      setSelectedTask(newTask);
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleUpdate = async (data: TaskInsert) => {
    if (!user?.id || !selectedTask) return;

    try {
      const updated = await updateTask(selectedTask.id, user.id, data);
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTask(updated);
      
      // Award XP if task was just completed
      if (data.status === 'Completed' && selectedTask.status !== 'Completed') {
        awardXP('task_completed', 25, { taskId: updated.id }).catch((err) => {
          console.error('[SeasonalCalendar] Failed to award XP:', err);
        });
      }
      
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(id, user.id);
      setTasks(tasks.filter((t) => t.id !== id));
      if (selectedTask?.id === id) {
        setSelectedTask(null);
      }
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!task.due_date) {
      if (!acc['No Due Date']) acc['No Due Date'] = [];
      acc['No Due Date'].push(task);
    } else {
      const dateKey = format(parseISO(task.due_date), 'MMMM d, yyyy');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  const sortedDates = Object.keys(tasksByDate).sort((a, b) => {
    if (a === 'No Due Date') return 1;
    if (b === 'No Due Date') return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Seasonal Calendar</h1>
          <p className="text-muted-foreground mt-1">Plan and track your homestead tasks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task List with Calendar View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle>Tasks by Date</CardTitle>
                <div className="flex items-center gap-3">
                  {properties.length > 0 && (
                    <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All Properties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Properties</SelectItem>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsCreating(true);
                      setSelectedTask(null);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Task
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {sortedDates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No tasks yet. Create your first task to get started.</p>
                </div>
              ) : (
                sortedDates.map((date) => (
                  <div key={date}>
                    <h3 className="font-semibold text-lg mb-3 text-foreground">{date}</h3>
                    <TaskList
                      tasks={tasksByDate[date]}
                      selectedId={selectedTask?.id}
                      onSelect={(task) => {
                        setSelectedTask(task);
                        setIsCreating(false);
                      }}
                      onDelete={handleDelete}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Task Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isCreating ? 'Create Task' : selectedTask ? 'Edit Task' : 'Task Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCreating || selectedTask ? (
                <TaskForm
                  task={selectedTask || undefined}
                  properties={properties}
                  onSubmit={isCreating ? handleCreate : handleUpdate}
                  onCancel={() => {
                    setIsCreating(false);
                    setSelectedTask(null);
                  }}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a task to view details or create a new one.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
