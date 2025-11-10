import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { MapPin, Sprout, Calendar, TrendingUp, CheckCircle2, Cloud, Droplets, Wind, Lightbulb } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getProperties } from "@/features/properties/api";
import { getTasks } from "@/features/tasks/api";
import { getInfrastructureProjects } from "@/features/infrastructure/api";
import { format } from "date-fns";

const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
};

export default function StrategicPlanningHub() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: properties = [] } = useQuery({
    queryKey: ["properties", user?.id],
    queryFn: () => getProperties(user!.id),
    enabled: !!user,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: () => getTasks(user!.id),
    enabled: !!user,
  });

  const { data: infrastructureProjects = [] } = useQuery({
    queryKey: ["infrastructure", user?.id],
    queryFn: () => getInfrastructureProjects(user!.id),
    enabled: !!user,
  });

  const incompleteTasks = tasks.filter((task) => task.status !== "completed").length;
  const currentSeason = getCurrentSeason();

  const upcomingTasks = tasks
    .filter((task) => task.status === "pending" || task.status === "in_progress")
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/10">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Strategic Planning Hub
            </h1>
            <p className="text-lg text-muted-foreground">
              Plan, assess, and strategically manage your homestead's future
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/property-assessment")}
              variant="outline"
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              Assess Property
            </Button>
            <Button
              onClick={() => navigate("/crop-planner")}
              className="gap-2"
            >
              <Sprout className="h-4 w-4" />
              Plan Crops
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Properties"
            value={properties.length}
            description="Mapped areas"
            icon={MapPin}
            tone="blue"
          />
          <StatCard
            title="Planning Tasks"
            value={incompleteTasks}
            description="Strategic items"
            icon={Calendar}
            tone="amber"
          />
          <StatCard
            title="Projects"
            value={infrastructureProjects.length}
            description="In planning"
            icon={TrendingUp}
            tone="green"
          />
          <StatCard
            title="Season"
            value={currentSeason}
            description="Current growing"
            tone="neutral"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📅 Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="No pending tasks"
                  description="Great job staying on top of your homestead!"
                />
              ) : (
                <div className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-1">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {task.category}
                          </Badge>
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground">
                              Due {format(new Date(task.due_date), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                Weather Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-foreground mb-2">72°F</div>
                  <div className="text-xl text-muted-foreground">Sunny</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Humidity</div>
                      <div className="font-medium">65%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Wind</div>
                      <div className="font-medium">8 mph</div>
                    </div>
                  </div>
                </div>

                <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 mt-4">
                  <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200 ml-2">
                    <strong>Garden Tip:</strong> Perfect weather for outdoor planting tasks!
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
