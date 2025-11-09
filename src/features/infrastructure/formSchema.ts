import { z } from "zod";

export const infrastructureFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Project name is required" })
    .max(100, { message: "Project name must be less than 100 characters" }),
  
  type: z
    .string()
    .min(1, { message: "Project type is required" }),
  
  status: z.enum(["planned", "in_progress", "completed"], {
    required_error: "Status is required",
  }),
  
  priority: z.enum(["low", "medium", "high", "urgent"], {
    required_error: "Priority is required",
  }),
  
  estimated_cost: z
    .number()
    .nonnegative({ message: "Cost must be a positive number" })
    .optional()
    .or(z.literal(0)),
  
  planned_completion: z.date().optional(),
  
  materials_needed: z
    .string()
    .max(500, { message: "Materials list must be less than 500 characters" })
    .optional(),
  
  notes: z
    .string()
    .max(1000, { message: "Notes must be less than 1000 characters" })
    .optional(),
});

export type InfrastructureFormData = z.infer<typeof infrastructureFormSchema>;
