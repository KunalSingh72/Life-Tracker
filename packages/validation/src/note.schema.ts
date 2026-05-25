import { z } from "zod";

export const NoteColorSchema = z.enum([
  "default",
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
]);

export const NoteStatusSchema = z.enum(["active", "trash"]);

export const NoteSchema = z.object({
  id: z.string().min(1),
  title: z.string().max(255).default(""),
  content: z.string().default(""), 
  color: NoteColorSchema.default("default"),
  isPinned: z.boolean().default(false),
  status: NoteStatusSchema.default("active"),
  deletedAt: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  goalId: z.string().nullable().optional()
});

export const CreateNoteSchema = NoteSchema.pick({
  title: true,
  content: true,
  color: true,
  goalId:true
}).partial();