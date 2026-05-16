import { z } from "zod";
import { 
  TaskSchema, 
  SubTaskSchema, 
  TaskPrioritySchema, 
  CreateTaskSchema 
} from "@life-tracker/validation/src/task.schema";

export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type SubTask = z.infer<typeof SubTaskSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskPayload = z.infer<typeof CreateTaskSchema>;

// Grouping types for UI consumption
export type GroupedOverdueTasks = Record<string, Task[]>;