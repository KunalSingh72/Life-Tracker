import { z } from "zod";
import { 
  NoteSchema, 
  CreateNoteSchema, 
  NoteColorSchema 
} from "@life-tracker/validation";

export type NoteColor = z.infer<typeof NoteColorSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type CreateNotePayload = z.infer<typeof CreateNoteSchema>;