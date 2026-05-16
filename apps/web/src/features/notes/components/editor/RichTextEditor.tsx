import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import EditorToolbar from "./EditorToolbar";
import { useNotesStore } from "../../store/notes.store";

interface RichTextEditorProps {
  noteId: string;
  initialContent: string;
}

export default function RichTextEditor({
  noteId,
  initialContent,
}: RichTextEditorProps) {
  const updateNote = useNotesStore((state) => state.updateNote);

  // FIX: Using ReturnType to automatically infer the correct Timeout type for the browser
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "rich-editor focus:outline-none w-full h-full p-6 text-text-primary",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        updateNote(noteId, { content: html });
      }, 500);
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-bg-main shadow-sm transition-all focus-within:border-primary/50">
      <div className="border-b border-border bg-bg-main/95 backdrop-blur-sm z-10">
        <EditorToolbar editor={editor} />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-bg-main">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
