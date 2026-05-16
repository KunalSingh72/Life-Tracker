import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Circle } from "lucide-react";
import type { TaskPriority } from "@life-tracker/types";
import { useTasksStore } from "../../store/tasks.store";
import { z } from "zod";

const FormSchema = z.object({
  title: z.string().min(1, "Task title is required").max(255),
});

type FormData = z.infer<typeof FormSchema>;

export default function TaskInput() {
  const addTask = useTasksStore((state) => state.addTask);
  const [activePriority, setActivePriority] = useState<TaskPriority>("low");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { title: "" },
  });

  const onSubmit = (data: FormData) => {
    addTask({
      title: data.title,
      priority: activePriority,
      dueDate: new Date().toISOString(),
    });
    reset();
    setActivePriority("low");
  };

  const priorities: { value: TaskPriority; colorClass: string }[] = [
    { value: "high", colorClass: "fill-red-500 text-red-500" },
    { value: "medium", colorClass: "fill-yellow-500 text-yellow-500" },
    { value: "low", colorClass: "fill-green-500 text-green-500" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 p-1">
      <div className="flex gap-2">
        <input
          {...register("title")}
          type="text"
          placeholder="What needs to be done?"
          autoComplete="off"
          className="flex-1 rounded-xl border border-border bg-bg-main px-4 py-3 text-sm text-text-primary outline-none focus:border-primary transition-colors placeholder:text-text-secondary"
        />
        <button
          type="submit"
          disabled={!isValid}
          className="flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-4 px-1">
        {priorities.map((p) => (
          <label
            key={p.value}
            className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold capitalize text-text-secondary hover:text-text-primary transition-colors"
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
              className={`h-3.5 w-3.5 transition-opacity ${
                activePriority === p.value ? p.colorClass : "text-text-secondary opacity-40"
              }`}
            />
            {p.value}
          </label>
        ))}
      </div>
    </form>
  );
}