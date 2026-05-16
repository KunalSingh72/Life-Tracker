import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 1. MOVED OUTSIDE: Reusable button primitive
const ToolbarBtn = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault(); // Prevents editor blur
      onClick();
    }}
    disabled={disabled}
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
      isActive
        ? "bg-primary/20 text-primary"
        : "text-text-secondary hover:bg-bg-card hover:text-text-primary",
      disabled &&
        "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-text-secondary",
    )}
  >
    {children}
  </button>
);

// 2. MOVED OUTSIDE: Divider primitive
const Divider = () => <div className="mx-1 h-5 w-px bg-border" />;

interface EditorToolbarProps {
  editor: Editor | null;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-1">
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
      >
        <Bold className="h-4 w-4" />
      </ToolbarBtn>

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
      >
        <Italic className="h-4 w-4" />
      </ToolbarBtn>

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarBtn>

      <Divider />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarBtn>

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarBtn>

      <Divider />

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
      >
        <List className="h-4 w-4" />
      </ToolbarBtn>

      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarBtn>

      <div className="flex-1" />

      <ToolbarBtn
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </ToolbarBtn>

      <ToolbarBtn
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </ToolbarBtn>
    </div>
  );
}
