import { Task } from './api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  selectedId?: string;
  onSelect: (task: Task) => void;
  onDelete: (id: string) => void;
}

const STATUS_COLORS = {
  'To Do': 'bg-muted text-muted-foreground',
  'In Progress': 'bg-accent text-accent-foreground',
  'Completed': 'bg-primary text-primary-foreground',
  'Cancelled': 'bg-destructive text-destructive-foreground',
};

export function TaskList({ tasks, selectedId, onSelect, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tasks yet. Create your first task to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className={`cursor-pointer transition-all hover:shadow-soft ${
            selectedId === task.id ? 'ring-2 ring-primary' : ''
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1" onClick={() => onSelect(task)}>
                <div className="flex items-start gap-2 mb-2">
                  <h3 className="font-semibold text-foreground flex-1">{task.title}</h3>
                  <Badge
                    className={STATUS_COLORS[task.status as keyof typeof STATUS_COLORS] || 'bg-muted'}
                  >
                    {task.status}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {task.category}
                    </Badge>
                  </span>
                  {task.due_date && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="text-destructive hover:text-destructive ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
