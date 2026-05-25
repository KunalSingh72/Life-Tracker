import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Calendar as CalendarIcon, Target, Flag, Tag, Palette, CalendarOff } from "lucide-react";
import { CreateGoalSchema } from "@life-tracker/validation";
import type { CreateGoalPayload, GoalCategory, GoalPriority } from "@life-tracker/types";
import { useGoalsStore } from "../store/goals.store";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Calendar } from "@/components/ui/Calendar"; // Adjust path to where you saved your Calendar component
import { cn } from "@/lib/utils";

interface GoalEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editGoalId?: string | null;
}

const CATEGORIES: { label: string; value: GoalCategory }[] = [
  { label: "Personal", value: "personal" }, { label: "Work", value: "work" },
  { label: "Health", value: "health" }, { label: "Finance", value: "finance" },
  { label: "Learning", value: "learning" }, { label: "Other", value: "other" },
];

const PRIORITIES: { label: string; value: GoalPriority; colorClass: string }[] = [
  { label: "High", value: "high", colorClass: "text-red-500 border-red-500/30 bg-red-500/10 hover:bg-red-500/20" },
  { label: "Medium", value: "medium", colorClass: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20" },
  { label: "Low", value: "low", colorClass: "text-green-500 border-green-500/30 bg-green-500/10 hover:bg-green-500/20" },
];

const COLORS = ["default", "red", "blue", "green", "yellow", "purple"];

type DialogConfig = { title: string; desc: string; action: () => void } | null;

export default function GoalEditorModal({ isOpen, onClose, editGoalId }: GoalEditorModalProps) {
  const { goals, addGoal, updateGoal} = useGoalsStore();
  const editingGoal = editGoalId ? goals.find((g) => g.id === editGoalId) : null;

  const [dialogConfig, setDialogConfig] = useState<DialogConfig>(null);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false); // Controls calendar popover visibility

  const [prevIsOpen, setPrevIsOpen] = useState(false);
  const [prevEditId, setPrevEditId] = useState<string | null | undefined>(undefined);

  const {
    register, handleSubmit, control, reset, setValue, watch, formState: { isValid },
  } = useForm<CreateGoalPayload>({
    resolver: zodResolver(CreateGoalSchema),
    mode: "onChange",
    defaultValues: { title: "", description: "", category: "personal", priority: "medium", color: "default", targetDate: "" },
  });

  // FIX Issue #1: Actively watch the date field so the component re-renders when it changes, unlocking the Save button
  const watchTargetDate = watch("targetDate");

  if (isOpen !== prevIsOpen || editGoalId !== prevEditId) {
    setPrevIsOpen(isOpen);
    setPrevEditId(editGoalId);
    if (isOpen) {
      setHasDeadline(editingGoal ? !!editingGoal.targetDate : false);
      setShowCalendar(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        reset({
          title: editingGoal.title, description: editingGoal.description,
          category: editingGoal.category, priority: editingGoal.priority,
          color: editingGoal.color,
          targetDate: editingGoal.targetDate ? new Date(editingGoal.targetDate).toISOString() : "",
        });
      } else {
        reset({ title: "", description: "", category: "personal", priority: "medium", color: "default", targetDate: "" });
      }
    }
  }, [isOpen, editingGoal, reset]);

  const onSubmit = (data: CreateGoalPayload) => {
    const formattedData = {
      ...data,
      targetDate: hasDeadline && data.targetDate ? new Date(data.targetDate as string).toISOString() : null,
    };
    if (editingGoal) updateGoal(editingGoal.id, formattedData);
    else addGoal(formattedData);
    onClose();
  };

  if (!isOpen) return null;

  const isArchived = editingGoal?.status === "archived";
  const todayDate = new Date();

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-bg-card shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-5 bg-bg-main/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Target className="h-5 w-5" /></div>
              <div>
                <h2 className="text-xl font-bold text-text-primary leading-tight flex items-center gap-2">
                  {editingGoal ? "Edit Goal" : "Create Strategic Goal"}
                  {isArchived && <span className="text-xs bg-bg-card border border-border px-2 py-0.5 rounded-md text-text-secondary">Archived</span>}
                </h2>
              </div>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-border hover:text-text-primary"><X className="h-5 w-5" /></button>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="goal-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <input {...register("title")} disabled={isArchived} placeholder="What is your overarching goal?" className="w-full rounded-xl border border-border bg-bg-main px-4 py-3 text-lg font-bold text-text-primary outline-none transition-colors focus:border-primary placeholder:text-text-secondary/60 disabled:opacity-60" />
                <textarea {...register("description")} disabled={isArchived} placeholder="Why is this important? (Optional)" rows={3} className="w-full resize-none rounded-xl border border-border bg-bg-main px-4 py-3 text-sm font-medium text-text-primary outline-none transition-colors focus:border-primary placeholder:text-text-secondary/60 custom-scrollbar disabled:opacity-60" />
              </div>

              <div className="h-px w-full bg-border" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Category & Priority Controllers (Hidden for brevity, keep your existing ones) */}
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-text-secondary uppercase tracking-wider"><Tag className="h-4 w-4" /> Category</label>
                  <Controller name="category" control={control} render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => (
                        <button key={c.value} type="button" disabled={isArchived} onClick={() => field.onChange(c.value)} className={cn("rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all disabled:opacity-60", field.value === c.value ? "border-primary bg-primary text-white shadow-md" : "border-border bg-bg-main text-text-secondary hover:border-primary/50")}>{c.label}</button>
                      ))}
                    </div>
                  )} />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-text-secondary uppercase tracking-wider"><Flag className="h-4 w-4" /> Priority</label>
                  <Controller name="priority" control={control} render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {PRIORITIES.map((p) => (
                        <button key={p.value} type="button" disabled={isArchived} onClick={() => field.onChange(p.value)} className={cn("rounded-lg border px-3 py-1.5 text-sm font-bold transition-all disabled:opacity-60", field.value === p.value ? p.colorClass : "border-border bg-bg-main text-text-secondary hover:bg-border")}>{p.label}</button>
                      ))}
                    </div>
                  )} />
                </div>
              </div>

              <div className="h-px w-full bg-border" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* FIX Issue #4: Custom Calendar Integration */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-bold text-text-secondary uppercase tracking-wider">
                      <CalendarIcon className="h-4 w-4" /> Deadline
                    </label>
                    <button
                      type="button" disabled={isArchived}
                      onClick={() => {
                        setHasDeadline(!hasDeadline);
                        if (hasDeadline) setValue("targetDate", "");
                        setShowCalendar(false);
                      }}
                      className={cn("text-xs font-bold transition-colors disabled:opacity-60", hasDeadline ? "text-red-500 hover:text-red-600" : "text-primary hover:text-primary/80")}
                    >
                      {hasDeadline ? "Remove Deadline" : "+ Set Deadline"}
                    </button>
                  </div>

                  {hasDeadline ? (
                    <div className="relative">
                      {/* Custom Input Trigger for Calendar */}
                      <button
                        type="button"
                        disabled={isArchived}
                        onClick={() => setShowCalendar(!showCalendar)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-medium outline-none transition-colors disabled:opacity-60",
                          watchTargetDate ? "border-primary/50 bg-primary/5 text-primary font-bold" : "border-border bg-bg-main text-text-secondary"
                        )}
                      >
                        <span>{watchTargetDate ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(watchTargetDate)) : "Select a date..."}</span>
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </button>

                      {/* Dropdown Custom Calendar */}
                      {showCalendar && (
                        <div className="absolute top-14 left-0 z-50 w-full animate-in slide-in-from-top-2">
                          <Controller 
                            name="targetDate" 
                            control={control} 
                            render={({ field }) => (
                              <div className="rounded-xl shadow-2xl ring-1 ring-border bg-bg-card">
                                <Calendar
                                  selectedDate={field.value ? new Date(field.value) : todayDate}
                                  minDate={todayDate}
                                  onDateSelect={(date) => {
                                    field.onChange(date.toISOString());
                                    setShowCalendar(false); // Close after selection
                                  }}
                                />
                              </div>
                            )} 
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-dashed border-border/60 bg-bg-main/50 px-4 text-sm font-medium text-text-secondary opacity-70">
                      <CalendarOff className="h-4 w-4" /> No deadline set
                    </div>
                  )}
                </div>

                {/* Color Picker */}
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-text-secondary uppercase tracking-wider"><Palette className="h-4 w-4" /> Card Color</label>
                  <Controller name="color" control={control} render={({ field }) => (
                    <div className="flex items-center gap-3 pt-1">
                      {COLORS.map((colorName) => {
                        let bgClass = "bg-bg-main";
                        if (colorName === "red") bgClass = "bg-red-500";
                        if (colorName === "blue") bgClass = "bg-blue-500";
                        if (colorName === "green") bgClass = "bg-green-500";
                        if (colorName === "yellow") bgClass = "bg-yellow-500";
                        if (colorName === "purple") bgClass = "bg-purple-500";
                        return <button key={colorName} type="button" disabled={isArchived} onClick={() => field.onChange(colorName)} className={cn("h-7 w-7 rounded-full border border-border/50 transition-all hover:scale-110 disabled:opacity-60 disabled:hover:scale-100", bgClass, field.value === colorName && "ring-2 ring-primary ring-offset-2 ring-offset-bg-card")} />;
                      })}
                    </div>
                  )} />
                </div>

              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border bg-bg-main/50 p-5">
            <div className="flex items-center gap-2">
              {/* Management actions (Archive/Delete) ... Keep existing code here */}
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-card hover:text-text-primary">Cancel</button>
              {!isArchived && (
                <button 
                  type="submit" 
                  form="goal-form" 
                  disabled={!isValid || (hasDeadline && !watchTargetDate)} 
                  className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-primary/90 disabled:transform-none disabled:opacity-50 disabled:shadow-none"
                >
                  {editingGoal ? "Save Changes" : "Create Goal"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog isOpen={!!dialogConfig} title={dialogConfig?.title || ""} description={dialogConfig?.desc || ""} confirmText="Delete" onConfirm={() => { dialogConfig?.action(); setDialogConfig(null); }} onCancel={() => setDialogConfig(null)} />
    </>
  );
}