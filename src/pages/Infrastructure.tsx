import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Infrastructure() {
  const [activeTab, setActiveTab] = useState("overview");

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
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Project Overview
            </h2>
            <p className="text-muted-foreground">
              Overview content will go here
            </p>
          </div>
        </TabsContent>

        <TabsContent value="planner" className="space-y-6 mt-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Project Planner
            </h2>
            <p className="text-muted-foreground">
              Project planner content will go here
            </p>
          </div>
        </TabsContent>

        <TabsContent value="estimator" className="space-y-6 mt-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Cost Estimator
            </h2>
            <p className="text-muted-foreground">
              Cost estimator content will go here
            </p>
          </div>
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
    </div>
  );
}
