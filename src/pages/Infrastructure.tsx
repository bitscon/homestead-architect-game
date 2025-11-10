import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard, EmptyState } from "@/components/ui";
import { FilterBar } from "@/components/ui/FilterBar";
import { Plus, DollarSign, ClipboardList, Building2, Pencil, Lightbulb, Calculator, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  getInfrastructureProjects,
  createInfrastructureProject,
  type InfrastructureProject,
  type InfrastructureProjectInsert
} from "@/features/infrastructure/api";
import { InfrastructureModal } from "@/features/infrastructure/InfrastructureModal";
import type { InfrastructureFormData } from "@/features/infrastructure/formSchema";

export default function Infrastructure() {
  const [activeTab, setActiveTab] = useState("overview");
  const [projects, setProjects] = useState<InfrastructureProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<InfrastructureProject | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { user } = useAuth();

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await getInfrastructureProjects(user.id);
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast.error("Failed to load infrastructure projects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (data: InfrastructureFormData) => {
    if (!user) return;

    try {
      const projectData: InfrastructureProjectInsert = {
        name: data.name,
        type: data.type,
        status: data.status,
        priority: data.priority,
        estimated_cost: data.estimated_cost,
        planned_completion: data.planned_completion?.toISOString(),
        materials_needed: data.materials_needed,
        notes: data.notes,
      };
      
      await createInfrastructureProject(user.id, projectData);
      toast.success("Project created successfully");
      await loadProjects();
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project");
      throw error;
    }
  };

  // Calculate stats
  const plannedCount = projects.filter(p => p.status === "planned").length;
  const inProgressCount = projects.filter(p => p.status === "in_progress").length;
  const completedCount = projects.filter(p => p.status === "completed").length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0);

  // Get recent projects (max 5)
  const recentProjects = projects.slice(0, 5);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "planned":
        return "default";
      case "in_progress":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "default";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatType = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filter projects based on search, status, and type
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = searchQuery === "" || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesType = typeFilter === "all" || project.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [projects, searchQuery, statusFilter, typeFilter]);

  const handleEditProject = (project: InfrastructureProject) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  // Cost calculations
  const totalBudgetCalc = projects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0);
  const plannedBudget = projects.filter(p => p.status === "planned").reduce((sum, p) => sum + (p.estimated_cost || 0), 0);
  const inProgressBudget = projects.filter(p => p.status === "in_progress").reduce((sum, p) => sum + (p.estimated_cost || 0), 0);
  const completedBudget = projects.filter(p => p.status === "completed").reduce((sum, p) => sum + (p.estimated_cost || 0), 0);
  
  const plannedPercent = totalBudgetCalc > 0 ? Math.round((plannedBudget / totalBudgetCalc) * 100) : 0;
  const inProgressPercent = totalBudgetCalc > 0 ? Math.round((inProgressBudget / totalBudgetCalc) * 100) : 0;
  const completedPercent = totalBudgetCalc > 0 ? Math.round((completedBudget / totalBudgetCalc) * 100) : 0;

  // Group by type
  const costByType = useMemo(() => {
    const grouped = projects.reduce((acc, project) => {
      const type = project.type;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += project.estimated_cost || 0;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .map(([type, cost]) => ({ type, cost }))
      .sort((a, b) => b.cost - a.cost);
  }, [projects]);

  // Group by priority
  const budgetByPriority = useMemo(() => {
    const grouped = projects.reduce((acc, project) => {
      const priority = project.priority;
      if (!acc[priority]) {
        acc[priority] = 0;
      }
      acc[priority] += project.estimated_cost || 0;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .map(([priority, cost]) => ({ priority, cost }))
      .sort((a, b) => {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority as keyof typeof order] - order[b.priority as keyof typeof order];
      });
  }, [projects]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Infrastructure Planning
        </h1>
        <p className="text-muted-foreground">
          Plan and track your homestead infrastructure projects
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-muted rounded-lg p-1 grid grid-cols-4">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="planner"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Project Planner
          </TabsTrigger>
          <TabsTrigger 
            value="estimator"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Cost Estimator
          </TabsTrigger>
          <TabsTrigger 
            value="timeline"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Section Title */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">
              Infrastructure Overview
            </h2>
          </div>

          {/* Stats Cards */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-lg border bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Planned"
                value={plannedCount}
                icon={ClipboardList}
                tone="blue"
                description="Projects in planning"
              />
              <StatCard
                title="In Progress"
                value={inProgressCount}
                icon={Building2}
                tone="amber"
                description="Active projects"
              />
              <StatCard
                title="Completed"
                value={completedCount}
                icon={Building2}
                tone="green"
                description="Finished projects"
              />
              <StatCard
                title="Total Budget"
                value={`$${totalBudget.toLocaleString()}`}
                icon={DollarSign}
                tone="neutral"
                description="Estimated costs"
              />
            </div>
          )}

          {/* Projects List Card */}
          <Card>
            <CardHeader className="bg-blue-50 dark:bg-blue-950/20 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Your Infrastructure Projects
                </CardTitle>
                <Button onClick={() => setIsModalOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : recentProjects.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No infrastructure projects yet"
                  description="Start planning your homestead infrastructure"
                  action={
                    <Button onClick={() => setIsModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium">{project.name}</h3>
                          <Badge variant={getStatusBadgeVariant(project.status)}>
                            {formatStatus(project.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="capitalize">{project.type.replace("_", " ")}</span>
                          {project.planned_completion && (
                            <span>
                              Due: {format(new Date(project.planned_completion), "MMM d, yyyy")}
                            </span>
                          )}
                          {project.estimated_cost && (
                            <span>${project.estimated_cost.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planner" className="space-y-6 mt-6">
          {/* Planning Tips Card */}
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  Planning Tips
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800">
                  High
                </Badge>
                <span className="text-sm text-amber-900 dark:text-amber-100">
                  Start with Essential Infrastructure
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                  Medium
                </Badge>
                <span className="text-sm text-amber-900 dark:text-amber-100">
                  Plan for Seasonal Needs
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                  Medium
                </Badge>
                <span className="text-sm text-amber-900 dark:text-amber-100">
                  Think Multi-Purpose
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  Low
                </Badge>
                <span className="text-sm text-amber-900 dark:text-amber-100">
                  Consider Maintenance Access
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Filter Bar */}
          <FilterBar
            searchPlaceholder="Search projects..."
            onSearch={setSearchQuery}
            statusOptions={[
              { value: "all", label: "All Status" },
              { value: "planned", label: "Planned" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
            ]}
            typeOptions={[
              { value: "all", label: "All Types" },
              { value: "greenhouse", label: "Greenhouse" },
              { value: "barn", label: "Barn" },
              { value: "shed", label: "Shed" },
              { value: "fence", label: "Fence" },
              { value: "water_system", label: "Water System" },
              { value: "other", label: "Other" },
            ]}
            onStatusChange={setStatusFilter}
            onTypeChange={setTypeFilter}
            onViewChange={setViewMode}
            showViewToggle={true}
          />

          {/* Projects List */}
          <Card>
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="text-lg font-semibold">
                Infrastructure Projects ({filteredProjects.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No projects match your filters"
                  description="Try adjusting your search or filter criteria"
                />
              ) : (
                <div className="space-y-4">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-lg">{project.name}</h3>
                          <Badge variant={getStatusBadgeVariant(project.status)}>
                            {formatStatus(project.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="capitalize font-medium">
                            {formatType(project.type)}
                          </span>
                          {project.estimated_cost && (
                            <span className="font-semibold">
                              ${project.estimated_cost.toLocaleString()}
                            </span>
                          )}
                          {project.planned_completion && (
                            <span>
                              Due: {format(new Date(project.planned_completion), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProject(project)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estimator" className="space-y-6 mt-6">
          {/* Section Title */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">
              Cost Analysis & Budgeting
            </h2>
          </div>

          {/* Budget Overview Cards */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-lg border bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Budget"
                value={`$${totalBudgetCalc.toLocaleString()}`}
                icon={DollarSign}
                tone="neutral"
                description="All projects"
              />
              <StatCard
                title="Planned"
                value={`$${plannedBudget.toLocaleString()}`}
                icon={ClipboardList}
                tone="blue"
                description={`${plannedPercent}% of budget`}
              />
              <StatCard
                title="In Progress"
                value={`$${inProgressBudget.toLocaleString()}`}
                icon={Building2}
                tone="amber"
                description={`${inProgressPercent}% of budget`}
              />
              <StatCard
                title="Completed"
                value={`$${completedBudget.toLocaleString()}`}
                icon={TrendingUp}
                tone="green"
                description={`${completedPercent}% of budget`}
              />
            </div>
          )}

          {/* Budget Progress */}
          <Card>
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="text-lg font-semibold">
                Budget Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Completed Projects</span>
                  <span className="text-muted-foreground">
                    ${completedBudget.toLocaleString()} / ${totalBudgetCalc.toLocaleString()}
                  </span>
                </div>
                <Progress value={completedPercent} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Active Projects</span>
                  <span className="text-muted-foreground">
                    ${inProgressBudget.toLocaleString()}
                  </span>
                </div>
                <Progress value={inProgressPercent} className="h-2 [&>div]:bg-amber-500" />
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdowns */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Cost by Type */}
            <Card>
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-lg font-semibold">
                  Cost by Infrastructure Type
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {costByType.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No cost data available
                  </p>
                ) : (
                  <div className="space-y-3">
                    {costByType.map(({ type, cost }) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {formatType(type)}
                        </span>
                        <span className="text-sm font-semibold">
                          ${cost.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Budget by Priority */}
            <Card>
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-lg font-semibold">
                  Budget by Priority
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {budgetByPriority.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No budget data available
                  </p>
                ) : (
                  <div className="space-y-3">
                    {budgetByPriority.map(({ priority, cost }) => (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority)}`} />
                          <span className="text-sm font-medium capitalize">
                            {priority}
                          </span>
                        </div>
                        <span className="text-sm font-semibold">
                          ${cost.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Cost Breakdown */}
          <Card>
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="text-lg font-semibold">
                Detailed Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <EmptyState
                  icon={Calculator}
                  title="No projects to estimate"
                  description="Add infrastructure projects to see cost breakdowns"
                  action={
                    <Button onClick={() => setIsModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project
                    </Button>
                  }
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Estimated Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell className="capitalize">{formatType(project.type)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(project.status)}>
                              {formatStatus(project.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${(project.estimated_cost || 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6 mt-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Timeline
            </h2>
            <p className="text-muted-foreground">
              Timeline content will go here
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Infrastructure Modal */}
      <InfrastructureModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
