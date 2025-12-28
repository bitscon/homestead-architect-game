import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { MapPin, Sprout, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getProperties } from "@/features/properties/api";
import { getTasks } from "@/features/tasks/api";
import { getInfrastructureProjects } from "@/features/infrastructure/api";
import { getRotationPlans } from "@/features/crops/rotationApi";
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

  const { data: cropRotations = [] } = useQuery({
    queryKey: ["crop-rotations", user?.id],
    queryFn: () => getRotationPlans(user!.id),
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

  const upcomingRotations = cropRotations
    .filter((rotation) => rotation.plant_date && new Date(rotation.plant_date) >= new Date())
    .sort((a, b) => {
      if (!a.plant_date) return 1;
      if (!b.plant_date) return -1;
      return new Date(a.plant_date).getTime() - new Date(b.plant_date).getTime();
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
            <CardHeader>
              <CardTitle>🌱 Crop Rotations</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingRotations.length === 0 ? (
                <EmptyState
                  icon={Sprout}
                  title="No crop rotations planned"
                  description="Start planning your seasonal crops"
                />
              ) : (
                <div className="space-y-4">
                  {upcomingRotations.map((rotation) => (
                    <div
                      key={rotation.id}
                      className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-1">
                          {rotation.name || rotation.crop_name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {rotation.plot_name}
                          </Badge>
                          {rotation.plant_date && (
                            <span className="text-xs text-muted-foreground">
                              Plant {format(new Date(rotation.plant_date), "MMM d, yyyy")}
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
        </div>
      </div>
    </div>
  );
}
