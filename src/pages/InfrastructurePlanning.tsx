import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { StatCard, SectionHeader, EmptyState, TabHeader, FilterBar } from "@/components/ui";
import { Plus, AlertCircle, Lightbulb, Calendar, Hammer, DollarSign, CheckCircle, Clock, Wrench } from "lucide-react";
import { InfrastructureModal } from "@/features/infrastructure/InfrastructureModal";
import { InfrastructureFormData } from "@/features/infrastructure/formSchema";
import {
  getInfrastructureProjects,
  createInfrastructureProject,
  InfrastructureProject,
  InfrastructureProjectInsert,
} from "@/features/infrastructure/api";

export default function InfrastructurePlanning() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch infrastructure projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["infrastructure", user?.id],
    queryFn: () => getInfrastructureProjects(user!.id),
    enabled: !!user?.id,
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: async (projectData: InfrastructureProjectInsert) => {
      return createInfrastructureProject(user!.id, projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["infrastructure", user?.id] });
      toast({
        title: "Success",
        description: "Infrastructure project created successfully",
      });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create infrastructure project",
        variant: "destructive",
      });
      console.error("Failed to create project:", error);
    },
  });

  // Calculate statistics
  const totalBudget = projects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0);
  const plannedProjects = projects.filter((p) => p.status === "planned");
  const inProgressProjects = projects.filter((p) => p.status === "in_progress");
  const completedProjects = projects.filter((p) => p.status === "completed");
  
  const plannedCount = plannedProjects.length;
  const inProgressCount = inProgressProjects.length;
  const completedCount = completedProjects.length;
  
  const plannedBudget = plannedProjects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0);
  const inProgressBudget = inProgressProjects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0);
  const completedBudget = completedProjects.reduce((sum, p) => sum + (p.estimated_cost || 0), 0);

  const budgetProgress = totalBudget > 0 ? ((plannedBudget + inProgressBudget + completedBudget) / totalBudget) * 100 : 0;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "planner", label: "Project Planner" },
    { id: "estimator", label: "Cost Estimator" },
    { id: "timeline", label: "Timeline" },
  ];

  // Filter options
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "planned", label: "Planned" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "greenhouse", label: "Greenhouse" },
    { value: "barn", label: "Barn" },
    { value: "fence", label: "Fence" },
    { value: "water_system", label: "Water System" },
    { value: "other", label: "Other" },
  ];

  // Filtered projects based on search and filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project: InfrastructureProject) => {
      // Search filter
      const matchesSearch = !searchQuery || 
        project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;

      // Type filter
      const matchesType = typeFilter === "all" || project.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [projects, searchQuery, statusFilter, typeFilter]);

  const handleCreateProject = async (data: InfrastructureFormData) => {
    const projectData = {
      name: data.name,
      type: data.type,
      status: data.status,
      priority: data.priority,
      estimated_cost: data.estimated_cost,
      planned_completion: data.planned_completion ? data.planned_completion.toISOString() : undefined,
      materials_needed: data.materials_needed,
      notes: data.notes,
    };
    await createMutation.mutateAsync(projectData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Infrastructure Planning</h1>
          <p className="text-muted-foreground">Plan and manage your homestead infrastructure projects</p>
        </div>
      </div>

      <TabHeader tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <SectionHeader title="Infrastructure Overview" />
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Planned"
                value={plannedCount}
                icon={Clock}
                tone="blue"
                description="Projects in planning"
              />
              <StatCard
                title="In Progress"
                value={inProgressCount}
                icon={Hammer}
                tone="amber"
                description="Currently building"
              />
              <StatCard
                title="Completed"
                value={completedCount}
                icon={CheckCircle}
                tone="green"
                description="Projects finished"
              />
              <StatCard
                title="Total Budget"
                value={`$${totalBudget.toLocaleString()}`}
                icon={DollarSign}
                tone="neutral"
                description="Across all projects"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Infrastructure Projects</CardTitle>
                <CardDescription>Manage all your infrastructure development projects</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : projects.length === 0 ? (
                  <EmptyState
                    title="No infrastructure projects yet"
                    description="Start planning your homestead infrastructure"
                    icon={Wrench}
                    action={
                      <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Project
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Project list will go here */}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Project Planner Tab */}
        {activeTab === "planner" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <SectionHeader title="Project Planner" />
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>

          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                Planning Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Start with Essential Infrastructure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Focus on water, shelter, and access roads first. These form the foundation for everything else.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Plan for Seasonal Needs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Consider weather patterns and seasonal access when scheduling construction projects.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Think Multi-Purpose</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Design structures that can serve multiple functions to maximize value and efficiency.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Consider Maintenance Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Plan for easy access to all infrastructure for repairs and regular maintenance.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <CardTitle>All Projects</CardTitle>
                  <FilterBar
                    searchPlaceholder="Search projects..."
                    onSearch={setSearchQuery}
                    statusOptions={statusOptions}
                    typeOptions={typeOptions}
                    onStatusChange={setStatusFilter}
                    onTypeChange={setTypeFilter}
                    onViewChange={setViewMode}
                    showViewToggle={true}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <EmptyState
                    title="No projects match your filters"
                    description="Try adjusting your search or filters"
                    icon={AlertCircle}
                  />
                ) : viewMode === "grid" ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription className="capitalize">
                            {project.type.replace(/_/g, " ")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status:</span>
                              <span className="font-medium capitalize">
                                {project.status.replace(/_/g, " ")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Priority:</span>
                              <span className="font-medium capitalize">{project.priority}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Budget:</span>
                              <span className="font-medium">
                                ${(project.estimated_cost || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {project.type.replace(/_/g, " ")}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-medium capitalize">
                              {project.status.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-muted-foreground">Status</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium capitalize">{project.priority}</p>
                            <p className="text-xs text-muted-foreground">Priority</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              ${(project.estimated_cost || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Budget</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cost Estimator Tab */}
        {activeTab === "estimator" && (
          <div className="space-y-6">
            <SectionHeader title="Cost Analysis & Budgeting" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Budget"
                value={`$${totalBudget.toLocaleString()}`}
                icon={DollarSign}
                tone="neutral"
                description="All projects combined"
              />
              <StatCard
                title="Planned"
                value={`$${plannedBudget.toLocaleString()}`}
                icon={Clock}
                tone="blue"
                description="Estimated costs"
              />
              <StatCard
                title="In Progress"
                value={`$${inProgressBudget.toLocaleString()}`}
                icon={Hammer}
                tone="amber"
                description="Current spending"
              />
              <StatCard
                title="Completed"
                value={`$${completedBudget.toLocaleString()}`}
                icon={CheckCircle}
                tone="green"
                description="Final costs"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Budget Progress</CardTitle>
                <CardDescription>Overall budget allocation across all projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={budgetProgress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    ${(plannedBudget + inProgressBudget + completedBudget).toLocaleString()} allocated
                  </span>
                  <span>{budgetProgress.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cost by Infrastructure Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    title="No cost data available yet"
                    icon={DollarSign}
                    className="py-8"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget by Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    title="No priority data available yet"
                    icon={AlertCircle}
                    className="py-8"
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Cost Breakdown</CardTitle>
                <CardDescription>Itemized costs for all infrastructure projects</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No cost data available"
                  description="Create projects to see detailed cost breakdowns"
                  icon={DollarSign}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <SectionHeader title="Project Calendar" />
            
            <FilterBar
              searchPlaceholder="Search projects..."
              onSearch={setSearchQuery}
              statusOptions={statusOptions}
              typeOptions={typeOptions}
              onStatusChange={setStatusFilter}
              onTypeChange={setTypeFilter}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project Timeline
                </CardTitle>
                <CardDescription>
                  {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <EmptyState
                    title="No scheduled projects"
                    description="Add projects with planned completion dates to see them on the timeline"
                    icon={Calendar}
                    action={
                      <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule Project
                      </Button>
                    }
                    className="py-16"
                  />
                ) : (
                  <div className="space-y-4">
                    {filteredProjects
                      .filter((p) => p.planned_completion)
                      .sort((a, b) => {
                        const dateA = a.planned_completion ? new Date(a.planned_completion).getTime() : 0;
                        const dateB = b.planned_completion ? new Date(b.planned_completion).getTime() : 0;
                        return dateA - dateB;
                      })
                      .map((project) => (
                        <Card key={project.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{project.name}</h4>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {project.type.replace(/_/g, " ")}
                                </p>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-sm font-medium capitalize">
                                    {project.status.replace(/_/g, " ")}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Status</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium capitalize">
                                    {project.priority}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Priority</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">
                                    {project.planned_completion
                                      ? new Date(project.planned_completion).toLocaleDateString()
                                      : "Not set"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Target Date</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    
                    {filteredProjects.filter((p) => p.planned_completion).length === 0 && (
                      <EmptyState
                        title="No projects with scheduled dates"
                        description="Add planned completion dates to your projects to see them here"
                        icon={Calendar}
                        className="py-12"
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
