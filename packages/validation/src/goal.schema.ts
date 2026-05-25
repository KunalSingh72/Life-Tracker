import { z } from "zod";

export const GoalStatusSchema = z.enum(["active", "completed", "archived"]);
export const GoalPrioritySchema = z.enum(["low", "medium", "high"]);
export const GoalCategorySchema = z.enum(["personal", "work", "health", "finance", "learning", "other"]);

export const GoalMilestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Milestone title is required").max(255),
  completed: z.boolean().default(false),
  order: z.number().default(0),
});

export const GoalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Goal title is required").max(255),
  description: z.string().default(""),
  category: GoalCategorySchema.default("personal"),
  priority: GoalPrioritySchema.default("medium"),
  status: GoalStatusSchema.default("active"),
  progress: z.number().min(0).max(100).default(0),
  targetDate: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  color: z.string().default("default"),
  
  // Relational & Hierarchical Data
  milestones: z.array(GoalMilestoneSchema).default([]),
  linkedTaskIds: z.array(z.string()).default([]),
  linkedNoteIds: z.array(z.string()).default([]),
  isManuallyCompleted: z.boolean().default(false),
});

export const CreateGoalSchema = z.object({
  title: z.string().min(1, "Goal title is required").max(255),
  description: z.string().optional(),
  category: GoalCategorySchema.optional(),
  priority: GoalPrioritySchema.optional(),
  targetDate: z.string().nullable().optional(), // Relaxed validation for UI form
  color: z.string().optional(),
});