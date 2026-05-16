import { z } from "zod";

export const TaskPrioritySchema = z.enum(["high", "medium", "low"]);

export const SubTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Subtask title is required").max(100),
  completed: z.boolean().default(false),
});

// The strict domain model for a fully created Task
export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Task title is required").max(255),
  completed: z.boolean().default(false),
  priority: TaskPrioritySchema.default("low"),
  dueDate: z.string().datetime().nullable(), 
  createdAt: z.string().datetime(),
  order: z.number().default(0), 
  subTasks: z.array(SubTaskSchema).default([]),
});

// The lenient payload for creating a new Task from the UI
export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(255),
  priority: TaskPrioritySchema.optional(),
  dueDate: z.string().datetime().nullable().optional(),
  completed: z.boolean().optional(),
  order: z.number().optional(),
  subTasks: z.array(SubTaskSchema).optional(),
});