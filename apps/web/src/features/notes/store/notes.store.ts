import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Note, CreateNotePayload, NoteColor } from "@life-tracker/types";

interface NotesState {
  notes: Note[];
  
  // Standard Actions
  addNote: (payload: CreateNotePayload) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  togglePin: (id: string) => void;
  changeColor: (id: string, color: NoteColor) => void;
  duplicateNote: (id: string) => void;
  deleteNote: (id: string) => void;
  // Trash & Lifecycle Actions
  moveToTrash: (id: string) => void;
  restoreNote: (id: string) => void;
  permanentDelete: (id: string) => void;
  emptyTrash: () => void;
  cleanupTrash: () => void; // Purges notes older than 30 days

  // Bulk Actions
  bulkMoveToTrash: (ids: string[]) => void;
  bulkRestore: (ids: string[]) => void;
  bulkPermanentDelete: (ids: string[]) => void;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (payload) => {
        const id = nanoid();
        const now = new Date().toISOString();
        const newNote: Note = {
          id,
          title: payload.title || "",
          content: payload.content || "",
          color: payload.color || "default",
          isPinned: false,
          status: "active",
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          goalId: payload.goalId || null, 
        };
        set((state) => ({ notes: [newNote, ...state.notes] }));
        return id;
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },
      togglePin: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() } : note
          ),
        }));
      },

      changeColor: (id, color) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, color, updatedAt: new Date().toISOString() } : note
          ),
        }));
      },

      duplicateNote: (id) => {
        const existing = get().notes.find((n) => n.id === id);
        if (existing) {
          const now = new Date().toISOString();
          set((state) => ({
            notes: [
              { 
                ...existing, 
                id: nanoid(), 
                isPinned: false, 
                createdAt: now, 
                updatedAt: now 
              },
              ...state.notes,
            ],
          }));
        }
      },

      // --- TRASH LIFECYCLE --- //

      moveToTrash: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, status: "trash", isPinned: false, deletedAt: new Date().toISOString() } : note
          ),
        }));
      },

      restoreNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, status: "active", deletedAt: null } : note
          ),
        }));
      },

      permanentDelete: (id) => {
        set((state) => ({ notes: state.notes.filter((note) => note.id !== id) }));
      },

      emptyTrash: () => {
        set((state) => ({ notes: state.notes.filter((note) => note.status !== "trash") }));
      },

      cleanupTrash: () => {
        const now = new Date().getTime();
        set((state) => ({
          notes: state.notes.filter((note) => {
            if (note.status !== "trash" || !note.deletedAt) return true;
            const deletedTime = new Date(note.deletedAt).getTime();
            // Keep it if it has been in trash for less than 30 days
            return now - deletedTime < THIRTY_DAYS_MS;
          }),
        }));
      },

      // --- BULK ACTIONS --- //

      bulkMoveToTrash: (ids) => {
        const now = new Date().toISOString();
        set((state) => ({
          notes: state.notes.map((note) =>
            ids.includes(note.id) ? { ...note, status: "trash", isPinned: false, deletedAt: now } : note
          ),
        }));
      },

      bulkRestore: (ids) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            ids.includes(note.id) ? { ...note, status: "active", deletedAt: null } : note
          ),
        }));
      },

      bulkPermanentDelete: (ids) => {
        set((state) => ({
          notes: state.notes.filter((note) => !ids.includes(note.id)),
        }));
      },
    }),
    { 
      name: "lifetracker-notes-storage",
      onRehydrateStorage: () => (state) => {
        // Automatically run the 30-day cleanup whenever the store loads from local storage
        if (state) state.cleanupTrash();
      }
    }
  )
);