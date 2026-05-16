import { useState, useMemo } from "react";
import { Plus, Search, Trash2, X, CheckSquare } from "lucide-react";
import { useNotesStore } from "./store/notes.store";
import NoteCard from "./components/cards/NoteCard";
import NoteEditorModal from "./components/NoteEditorModal";
import TrashModal from "./components/TrashModal";
import { extractPreviewText } from "./utils/note.utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type DialogConfig = { title: string; desc: string; action: () => void } | null;

export default function NotesPage() {
  const { notes, addNote, moveToTrash, bulkMoveToTrash } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectionMode = selectedIds.length > 0;

  const handleCreateNote = () => {
    const newNoteId = addNote({ title: "", content: "", color: "default" });
    setActiveNoteId(newNoteId);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const activeNotes = useMemo(
    () => notes.filter((n) => n.status === "active"),
    [notes],
  );

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return activeNotes;
    const query = searchQuery.toLowerCase();

    return activeNotes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(query);
      const contentMatch = extractPreviewText(note.content)
        .toLowerCase()
        .includes(query);
      return titleMatch || contentMatch;
    });
  }, [activeNotes, searchQuery]);

  const handleSelectAll = () => {
    const visibleIds = filteredNotes.map((n) => n.id);
    const allVisibleSelected =
      visibleIds.every((id) => selectedIds.includes(id)) &&
      visibleIds.length > 0;

    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      const newIds = new Set([...selectedIds, ...visibleIds]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const isAllVisibleSelected =
    filteredNotes.length > 0 &&
    filteredNotes.every((n) => selectedIds.includes(n.id));

  const handleBulkDelete = () => {
    setDialogConfig({
      title: "Delete Multiple Notes",
      desc: `Are you sure you want to move ${selectedIds.length} notes to the recycle bin?`,
      action: () => {
        bulkMoveToTrash(selectedIds);
        setSelectedIds([]);
      },
    });
  };

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <div className="flex h-full w-full flex-col relative">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">
            Notes
          </h2>
          <p className="text-sm font-medium text-text-secondary">
            Capture ideas, format rich text, and organize your thoughts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex w-full md:w-64 items-center">
            <Search className="absolute left-3 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg-main py-2 pl-10 pr-4 text-sm text-text-primary outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            onClick={handleSelectAll}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors shrink-0 ${
              isAllVisibleSelected
                ? "bg-primary/10 text-primary border-primary/30"
                : "border-border bg-bg-main text-text-secondary hover:text-text-primary hover:bg-bg-card"
            }`}
            title={
              isAllVisibleSelected
                ? "Unselect All Visible"
                : "Select All Visible"
            }
          >
            <CheckSquare className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsTrashOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-main text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors shrink-0"
            title="Recycle Bin"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            onClick={handleCreateNote}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            Create Note
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24">
        {pinnedNotes.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-secondary">
              Pinned
            </h3>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedIds.includes(note.id)}
                  selectionMode={selectionMode}
                  onSelectToggle={toggleSelection}
                  onClick={(n) => setActiveNoteId(n.id)}
                  onDeleteRequest={(n) =>
                    setDialogConfig({
                      title: "Move to Trash",
                      desc: `Are you sure you want to move "${n.title || "Untitled"}" to the recycle bin?`,
                      action: () => moveToTrash(n.id),
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}

        {otherNotes.length > 0 && (
          <div>
            {pinnedNotes.length > 0 && (
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-secondary">
                Others
              </h3>
            )}
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {otherNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedIds.includes(note.id)}
                  selectionMode={selectionMode}
                  onSelectToggle={toggleSelection}
                  onClick={(n) => setActiveNoteId(n.id)}
                  onDeleteRequest={(n) =>
                    setDialogConfig({
                      title: "Move to Trash",
                      desc: `Are you sure you want to move "${n.title || "Untitled"}" to the recycle bin?`,
                      action: () => moveToTrash(n.id),
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}

        {filteredNotes.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-text-secondary">
            <p className="text-lg font-medium">No notes found.</p>
          </div>
        )}
      </div>

      {selectionMode && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 rounded-full bg-bg-card border border-border shadow-2xl px-6 py-3 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-bold text-text-primary bg-primary/10 px-2 py-1 rounded-md">
            {selectedIds.length} Selected
          </span>
          <div className="h-6 w-px bg-border mx-2" />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Move to Trash
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors ml-2"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
        </div>
      )}

      <NoteEditorModal
        key={activeNoteId || "empty"}
        noteId={activeNoteId}
        onClose={() => setActiveNoteId(null)}
      />
      <TrashModal isOpen={isTrashOpen} onClose={() => setIsTrashOpen(false)} />

      <ConfirmDialog
        isOpen={!!dialogConfig}
        title={dialogConfig?.title || ""}
        description={dialogConfig?.desc || ""}
        confirmText="Delete"
        onConfirm={() => {
          dialogConfig?.action();
          setDialogConfig(null);
        }}
        onCancel={() => setDialogConfig(null)}
      />
    </div>
  );
}
