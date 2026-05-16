import { useState, useRef, useEffect } from "react";
import { X, Palette } from "lucide-react";
import RichTextEditor from "./editor/RichTextEditor";
import { useNotesStore } from "../store/notes.store";
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

  const [title, setTitle] = useState(note?.title || "");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null); // Ref for outside click detection

  // Handle click outside to close color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColorPicker]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-0 md:p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className={cn(
          "relative flex h-full md:h-[90vh] w-full max-w-5xl flex-col overflow-hidden md:rounded-2xl border shadow-2xl transition-colors duration-300",
          activeColorClasses,
        )}
      >
        {/* FIX: relative z-20 ensures the header and its dropdowns render ABOVE the text editor */}
        <div className="relative z-20 flex items-center gap-2 border-b border-border/50 p-3 md:p-4 bg-bg-card/50 backdrop-blur-md">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Note Title..."
            className="flex-1 bg-transparent text-xl md:text-2xl font-bold text-text-primary outline-none placeholder:text-text-secondary"
          />

          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bg-main text-text-secondary transition-colors hover:text-text-primary"
            >
              <Palette className="h-5 w-5" />
            </button>

            {/* FIX: Absolute panel z-index boosted and controlled by click-outside ref */}
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

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-main text-text-secondary transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Removed Zoom styling wrapper */}
        <div className="flex-1 overflow-hidden bg-transparent p-0 md:p-4">
          <RichTextEditor noteId={note.id} initialContent={note.content} />
        </div>
      </div>
    </div>
  );
}
