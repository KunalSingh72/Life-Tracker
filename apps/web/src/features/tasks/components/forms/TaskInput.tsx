import { useState, useRef, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Circle, Target, ChevronDown } from "lucide-react";
import type { TaskPriority } from "@life-tracker/types";
import { useTasksStore } from "../../store/tasks.store";
import { useGoalsStore } from "../../../goals/store/goals.store"; // NEW
import { z } from "zod";
import { cn } from "@/lib/utils";

const FormSchema = z.object({
  title: z.string().min(1, "Task title is required").max(255),
});
type FormData = z.infer<typeof FormSchema>;

export default function TaskInput() {
  const addTask = useTasksStore((state) => state.addTask);
  const goals = useGoalsStore((state) => state.goals);
  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "active"),
    [goals],
  );

  const [activePriority, setActivePriority] = useState<TaskPriority>("low");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null); // NEW
  const [showGoalDropdown, setShowGoalDropdown] = useState(false); // NEW
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { title: "" },
  });

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowGoalDropdown(false);
      }
    };
    if (showGoalDropdown)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showGoalDropdown]);

  const onSubmit = (data: FormData) => {
    addTask({
      title: data.title,
      priority: activePriority,
      dueDate: new Date().toISOString(),
      goalId: selectedGoalId, // NEW
    });
    reset();
    setActivePriority("low");
    setSelectedGoalId(null);
  };

  const priorities: { value: TaskPriority; colorClass: string }[] = [
    { value: "high", colorClass: "fill-red-500 text-red-500" },
    { value: "medium", colorClass: "fill-yellow-500 text-yellow-500" },
    { value: "low", colorClass: "fill-green-500 text-green-500" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-1">
      <div className="flex gap-3">
        <input
          {...register("title")}
          type="text"
          placeholder="What needs to be done?"
          autoComplete="off"
          className="flex-1 rounded-xl border-2 border-border bg-bg-main px-5 py-4 text-base font-medium text-text-primary outline-none focus:border-primary transition-all placeholder:text-text-secondary/70 focus:shadow-sm"
        />
        <button
          type="submit"
          disabled={!isValid}
          className="flex h-15 w-15 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none disabled:opacity-50"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-5">
          {priorities.map((p) => (
            <label
              key={p.value}
              className="flex items-center gap-2 cursor-pointer text-sm font-bold capitalize text-text-secondary hover:text-text-primary transition-colors"
            >
              <input
                type="radio"
                name="priority"
                value={p.value}
                checked={activePriority === p.value}
                onChange={() => setActivePriority(p.value)}
                className="hidden"
              />
              <Circle
                className={`h-4 w-4 transition-all duration-300 ${activePriority === p.value ? `${p.colorClass} scale-110` : "text-text-secondary opacity-40"}`}
              />
              {p.value}
            </label>
          ))}
        </div>

        {/* NEW: Goal Link Dropdown */}
        {activeGoals.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowGoalDropdown(!showGoalDropdown)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all border",
                selectedGoalId
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-bg-main text-text-secondary border-border hover:border-primary/50 hover:text-text-primary",
              )}
            >
              <Target className="h-3.5 w-3.5" />
              <span className="max-w-30 truncate">
                {selectedGoalId
                  ? activeGoals.find((g) => g.id === selectedGoalId)?.title
                  : "Link Goal"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>

            {showGoalDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-bg-card p-2 shadow-xl z-50 animate-in slide-in-from-top-2">
                <div className="mb-1 px-2 py-1 text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Active Goals
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGoalId(null);
                    setShowGoalDropdown(false);
                  }}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                    !selectedGoalId
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-bg-main hover:text-text-primary",
                  )}
                >
                  None
                </button>
                {activeGoals.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setSelectedGoalId(g.id);
                      setShowGoalDropdown(false);
                    }}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors truncate",
                      selectedGoalId === g.id
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
      </div>
    </form>
  );
}
