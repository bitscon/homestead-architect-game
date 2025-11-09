import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { TabHeader } from "@/components/ui/TabHeader";
import { Plus, Search, AlertCircle, Lightbulb, Calendar, Hammer, DollarSign, CheckCircle, Clock, Wrench } from "lucide-react";

export default function InfrastructurePlanning() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Mock data - replace with Supabase query
  const projects = [];
  const totalBudget = 0;
  const plannedBudget = 0;
  const inProgressBudget = 0;
  const completedBudget = 0;
  const plannedCount = 0;
  const inProgressCount = 0;
  const completedCount = 0;

  const budgetProgress = totalBudget > 0 ? ((plannedBudget + inProgressBudget + completedBudget) / totalBudget) * 100 : 0;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "planner", label: "Project Planner" },
    { id: "estimator", label: "Cost Estimator" },
    { id: "timeline", label: "Timeline" },
  ];

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
              <Button>
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
                {projects.length === 0 ? (
                  <EmptyState
                    title="No infrastructure projects yet"
                    description="Start planning your homestead infrastructure"
                    icon={Wrench}
                    action={
                      <Button>
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
              <Button>
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>All Projects</CardTitle>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full sm:w-[250px]"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="water">Water Systems</SelectItem>
                        <SelectItem value="shelter">Shelters</SelectItem>
                        <SelectItem value="fencing">Fencing</SelectItem>
                        <SelectItem value="storage">Storage</SelectItem>
                        <SelectItem value="power">Power Systems</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <EmptyState
                    title="No projects match your filters"
                    description="Try adjusting your search or filters"
                    icon={AlertCircle}
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Filtered project list will go here */}
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
            <div className="flex items-center justify-between">
              <SectionHeader title="Project Calendar" />
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="month">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month View</SelectItem>
                    <SelectItem value="year">Year View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project Timeline
                </CardTitle>
                <CardDescription>Schedule and track your infrastructure projects</CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="No scheduled projects"
                  description="Add projects with start and end dates to see them on the calendar"
                  icon={Calendar}
                  action={
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Project
                    </Button>
                  }
                  className="py-16"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
