import { z } from "zod";
import {
  GoalSchema,
  CreateGoalSchema,
  GoalStatusSchema,
  GoalPrioritySchema,
  GoalCategorySchema,
  GoalMilestoneSchema
} from "@life-tracker/validation";

export type GoalStatus = z.infer<typeof GoalStatusSchema>;
export type GoalPriority = z.infer<typeof GoalPrioritySchema>;
export type GoalCategory = z.infer<typeof GoalCategorySchema>;
export type GoalMilestone = z.infer<typeof GoalMilestoneSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type CreateGoalPayload = z.infer<typeof CreateGoalSchema>;