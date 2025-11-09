import { supabase } from "@/integrations/supabase/client";

export interface InfrastructureProject {
  id: string;
  user_id: string;
  name: string;
  type: string;
  status: "planned" | "in_progress" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  estimated_cost?: number;
  planned_completion?: string;
  materials_needed?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InfrastructureProjectInsert {
  name: string;
  type: string;
  status: "planned" | "in_progress" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  estimated_cost?: number;
  planned_completion?: string;
  materials_needed?: string;
  notes?: string;
}

export async function getInfrastructureProjects(
  userId: string
): Promise<InfrastructureProject[]> {
  const { data, error } = await (supabase as any)
    .from("infrastructure")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as InfrastructureProject[];
}

export async function createInfrastructureProject(
  userId: string,
  project: InfrastructureProjectInsert
): Promise<InfrastructureProject> {
  const { data, error } = await (supabase as any)
    .from("infrastructure")
    .insert({
      user_id: userId,
      ...project,
    })
    .select()
    .single();

  if (error) throw error;
  return data as InfrastructureProject;
}

export async function updateInfrastructureProject(
  id: string,
  userId: string,
  project: Partial<InfrastructureProjectInsert>
): Promise<InfrastructureProject> {
  const { data, error} = await (supabase as any)
    .from("infrastructure")
    .update(project)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as InfrastructureProject;
}

export async function deleteInfrastructureProject(
  id: string,
  userId: string
): Promise<void> {
  const { error } = await (supabase as any)
    .from("infrastructure")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}
