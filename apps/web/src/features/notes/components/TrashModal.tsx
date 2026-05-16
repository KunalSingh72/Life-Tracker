import { X, RotateCcw, Trash2, AlertTriangle } from "lucide-react";
import { useNotesStore } from "../store/notes.store";
import { extractPreviewText } from "../utils/note.utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useState } from "react";

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrashModal({ isOpen, onClose }: TrashModalProps) {
  const { notes, restoreNote, permanentDelete, emptyTrash } = useNotesStore();
  const [isConfirmEmptyOpen, setIsConfirmEmptyOpen] = useState(false);

  if (!isOpen) return null;

  const trashNotes = notes.filter((n) => n.status === "trash");

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border p-4 bg-bg-main/50">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-bold text-text-primary">
                Recycle Bin
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {trashNotes.length > 0 && (
                <button
                  onClick={() => setIsConfirmEmptyOpen(true)}
                  className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                >
                  Empty Trash
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-border hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {trashNotes.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-text-secondary opacity-70">
                <Trash2 className="h-12 w-12 mb-2 opacity-20" />
                <p>The recycle bin is empty.</p>
                <p className="text-xs mt-1">
                  Items in trash are permanently deleted after 30 days.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 text-xs font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  Items here will be permanently deleted after 30 days.
                </div>

                {trashNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border bg-bg-main hover:border-primary/30 transition-colors"
                  >
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-semibold text-text-primary truncate">
                        {note.title || "Untitled"}
                      </h4>
                      <p className="text-xs text-text-secondary truncate">
                        {extractPreviewText(note.content) || "No content"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => restoreNote(note.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Restore
                      </button>
                      <button
                        onClick={() => permanentDelete(note.id)}
                        className="p-1.5 rounded-lg text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmEmptyOpen}
        title="Empty Recycle Bin"
        description="Are you sure you want to permanently delete all items in the recycle bin? This action cannot be undone."
        confirmText="Empty Trash"
        onConfirm={() => {
          emptyTrash();
          setIsConfirmEmptyOpen(false);
        }}
        onCancel={() => setIsConfirmEmptyOpen(false)}
      />
    </>
  );
}
