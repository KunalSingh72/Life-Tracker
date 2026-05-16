import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-bg-card p-6 shadow-xl">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-text-primary">{title}</h2>
          <p className="mb-6 text-sm text-text-secondary">{description}</p>

          <div className="flex w-full gap-3">
            <Button variant="outline" fullWidth onClick={onCancel}>
              {cancelText}
            </Button>
            <Button variant="danger" fullWidth onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
