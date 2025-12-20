import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RotationPlan } from '@/features/crops/rotationApi';

interface PlantingCalendarProps {
  plans: RotationPlan[];
}

export const PlantingCalendar = ({ plans }: PlantingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay();
  
  // Add padding days from previous month
  const paddingDays = Array(firstDayOfWeek).fill(null);
  
  const allDays = [...paddingDays, ...daysInMonth];

  const getPlansForDate = (date: Date) => {
    return plans.filter(plan => {
      if (!plan.plant_date) return false;
      const plantDate = new Date(plan.plant_date);
      return isSameDay(plantDate, date);
    });
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const today = () => setCurrentMonth(new Date());

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={today}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {allDays.map((day, index) => {
            if (!day) {
              return <div key={`padding-${index}`} className="min-h-[100px]" />;
            }

            const dayPlans = getPlansForDate(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[100px] p-2 border rounded-lg transition-colors",
                  !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                  isToday && "border-primary border-2",
                  dayPlans.length > 0 && "bg-primary/5"
                )}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayPlans.map(plan => (
                    <div
                      key={plan.id}
                      className="text-xs p-1 rounded bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                      title={`${plan.name} - ${plan.crop_name}`}
                    >
                      <div className="font-medium truncate">{plan.crop_name}</div>
                      <div className="text-muted-foreground truncate">{plan.plot_name}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary rounded" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/5 border rounded" />
          <span>Has plantings</span>
        </div>
      </div>
    </div>
  );
};
