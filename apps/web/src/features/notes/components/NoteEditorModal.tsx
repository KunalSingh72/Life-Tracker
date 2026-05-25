import { useState, useRef, useEffect, useMemo } from "react";
import { X, Palette, Target } from "lucide-react";
import RichTextEditor from "./editor/RichTextEditor";
import { useNotesStore } from "../store/notes.store";
import { useGoalsStore } from "../../goals/store/goals.store"; // NEW
import { getNoteColorClasses } from "../utils/note.utils";
import type { NoteColor } from "@life-tracker/types";
import { cn } from "@/lib/utils";

interface NoteEditorModalProps {
  noteId: string | null;
  onClose: () => void;
}

export default function NoteEditorModal({
  noteId,
  onClose,
}: NoteEditorModalProps) {
  const { notes, updateNote, changeColor } = useNotesStore();
  const note = notes.find((n) => n.id === noteId);

  // Safely grab goals and memoize them to prevent re-render loops
  const rawGoals = useGoalsStore((state) => state.goals);
  const activeGoals = useMemo(
    () => rawGoals.filter((g) => g.status === "active"),
    [rawGoals],
  );

  const [title, setTitle] = useState(note?.title || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false); // NEW

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const goalPickerRef = useRef<HTMLDivElement>(null); // NEW

  // Handle click outside to close color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
      if (
        goalPickerRef.current &&
        !goalPickerRef.current.contains(event.target as Node)
      ) {
        setShowGoalPicker(false);
      }
    };

    if (showColorPicker || showGoalPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColorPicker, showGoalPicker]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      if (noteId) updateNote(noteId, { title: newTitle });
    }, 500);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!note || !noteId) return null;

  const activeColorClasses = getNoteColorClasses(note.color);
  const linkedGoal = note.goalId
    ? rawGoals.find((g) => g.id === note.goalId)
    : null; // NEW

  const colors: { value: NoteColor; class: string }[] = [
    { value: "default", class: "bg-bg-main border-border" },
    { value: "red", class: "bg-red-500/20 border-red-500/50" },
    { value: "blue", class: "bg-blue-500/20 border-blue-500/50" },
    { value: "green", class: "bg-green-500/20 border-green-500/50" },
    { value: "yellow", class: "bg-yellow-500/20 border-yellow-500/50" },
    { value: "purple", class: "bg-purple-500/20 border-purple-500/50" },
  ];

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm animate-in fade-in duration-200 md:p-4"
    >
      <div
        className={cn(
          "relative flex h-full w-full max-w-5xl flex-col overflow-hidden border shadow-2xl transition-colors duration-300 md:h-[90vh] md:rounded-2xl",
          activeColorClasses,
        )}
      >
        <div className="relative z-20 flex items-center gap-2 border-b border-border/50 bg-bg-card/50 p-3 backdrop-blur-md md:p-4">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Note Title..."
            className="flex-1 bg-transparent text-xl font-bold text-text-primary outline-none placeholder:text-text-secondary md:text-2xl"
          />

          <div className="flex items-center gap-2">
            {/* NEW: Goal Link Dropdown */}
            {activeGoals.length > 0 && (
              <div className="relative" ref={goalPickerRef}>
                <button
                  onClick={() => setShowGoalPicker(!showGoalPicker)}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-xl border px-3 transition-colors",
                    note.goalId
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-bg-main text-text-secondary hover:text-text-primary",
                  )}
                  title={
                    linkedGoal
                      ? `Linked to: ${linkedGoal.title}`
                      : "Link to a Goal"
                  }
                >
                  <Target className="h-5 w-5" />
                  <span className="hidden max-w-30 truncate text-sm font-bold md:inline">
                    {linkedGoal ? linkedGoal.title : "Link Goal"}
                  </span>
                </button>

                {showGoalPicker && (
                  <div className="absolute right-0 top-12 z-50 flex w-56 flex-col gap-1 rounded-xl border border-border bg-bg-card p-2 shadow-xl animate-in slide-in-from-top-2">
                    <div className="mb-1 px-2 py-1 text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Active Goals
                    </div>
                    <button
                      onClick={() => {
                        updateNote(noteId, { goalId: null });
                        setShowGoalPicker(false);
                      }}
                      className={cn(
                        "w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                        !note.goalId
                          ? "bg-primary/10 text-primary"
                          : "text-text-secondary hover:bg-bg-main hover:text-text-primary",
                      )}
                    >
                      None
                    </button>
                    {activeGoals.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          updateNote(noteId, { goalId: g.id });
                          setShowGoalPicker(false);
                        }}
                        className={cn(
                          "w-full truncate rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                          note.goalId === g.id
                            ? "bg-primary/10 text-primary"
                            : "text-text-primary hover:bg-bg-main",
                        )}
                      >
                        {g.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Existing Color Picker */}
            <div className="relative" ref={colorPickerRef}>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-main text-text-secondary transition-colors hover:text-text-primary"
              >
                <Palette className="h-5 w-5" />
              </button>

              {showColorPicker && (
                <div className="absolute right-0 top-12 z-50 flex gap-2 rounded-xl border border-border bg-bg-card p-3 shadow-xl animate-in slide-in-from-top-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        changeColor(noteId, c.value);
                        setShowColorPicker(false);
                      }}
                      className={cn(
                        "h-6 w-6 rounded-full border transition-transform hover:scale-110",
                        c.class,
                        note.color === c.value &&
                          "ring-2 ring-primary ring-offset-2 ring-offset-bg-card",
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-main text-text-secondary transition-colors hover:bg-red-500/10 hover:text-red-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-transparent p-0 md:p-4">
          <RichTextEditor noteId={note.id} initialContent={note.content} />
        </div>
      </div>
    </div>
  );
}
