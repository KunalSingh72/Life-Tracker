import { Pin, Trash2, Copy, Check, Target } from "lucide-react";
import type { Note } from "@life-tracker/types";
import { useNotesStore } from "../../store/notes.store";
import { useGoalsStore } from "@/features/goals/store/goals.store"; 
import {
  extractPreviewText,
  formatNoteDate,
  getNoteColorClasses,
} from "../../utils/note.utils";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
  onDeleteRequest: (note: Note) => void;
  isSelected?: boolean;
  onSelectToggle?: (id: string) => void;
  selectionMode?: boolean;
}

export default function NoteCard({
  note,
  onClick,
  onDeleteRequest,
  isSelected = false,
  onSelectToggle,
  selectionMode = false,
}: NoteCardProps) {
  const { togglePin, duplicateNote } = useNotesStore();

  // NEW: Fetch linked goal
  const { goals } = useGoalsStore();
  const linkedGoal = note.goalId
    ? goals.find((g) => g.id === note.goalId)
    : null;

  const previewText = extractPreviewText(note.content);
  const colorClasses = getNoteColorClasses(note.color);

  // We can remove the manual substring truncation since we will use CSS line-clamp
  const previewContent = previewText || "";

  const handleCardClick = () => {
    if (selectionMode) {
      onSelectToggle?.(note.id);
    } else {
      onClick(note);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        // FIX 1: Added 'w-full' and 'overflow-hidden' to strictly bind the card to the column width
        "group relative cursor-pointer break-inside-avoid mb-4 flex w-full flex-col overflow-hidden rounded-2xl border p-4 transition-all duration-200",
        colorClasses,
        isSelected
          ? "shadow-[inset_0_0_0_2px_var(--color-primary)] border-transparent"
          : "border-border shadow-sm",
      )}
    >
      <div
        className={cn(
          "absolute left-3 top-3 z-10 transition-opacity",
          isSelected || selectionMode
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100",
        )}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectToggle?.(note.id);
          }}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-sm border transition-colors",
            isSelected
              ? "border-primary bg-primary text-white"
              : "border-border bg-bg-main hover:border-primary",
          )}
        >
          {isSelected && <Check className="h-3.5 w-3.5" />}
        </div>
      </div>

      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-border bg-bg-card/80 px-1 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePin(note.id);
          }}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
            note.isPinned
              ? "text-primary"
              : "text-text-secondary hover:text-text-primary",
          )}
          title="Pin note"
        >
          <Pin className={cn("h-3.5 w-3.5", note.isPinned && "fill-current")} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            duplicateNote(note.id);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-primary"
          title="Duplicate note"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRequest(note);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-red-500/10 hover:text-red-500"
          title="Delete note"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* FIX 2: Changed to 'break-all' to aggressively slice unbroken spam text */}
      <h3 className="mb-2 pl-8 pr-20 text-lg font-bold leading-tight text-text-primary break-all">
        {note.title || "Untitled"}
      </h3>

      {/* FIX 3: Added 'line-clamp-4' and 'break-all' to handle massive text blocks perfectly */}
      <div className="mb-4 whitespace-pre-wrap leading-relaxed text-sm text-text-secondary break-all line-clamp-4">
        {previewContent || (
          <span className="italic opacity-50">Empty note...</span>
        )}
      </div>

      {/* INTEGRATED: Flexbox layout to accommodate the date and the new Goal Badge */}
      <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3">
        <span className="text-xs font-semibold text-text-secondary/70">
          {formatNoteDate(note.updatedAt)}
        </span>

        {/* THE LINKED GOAL BADGE */}
        {linkedGoal && (
          <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary shadow-sm">
            <Target className="h-3 w-3 shrink-0" />
            <span className="max-w-[120px] truncate">{linkedGoal.title}</span>
          </div>
        )}
      </div>
    </div>
  );
}
