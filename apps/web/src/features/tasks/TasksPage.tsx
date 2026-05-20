import TodayTasksCard from "./components/cards/TodayTasksCard";
import OverdueTasksCard from "./components/cards/OverdueTasksCard";
import UpcomingTasksCard from "./components/cards/UpcomingTasksCard";

export default function TasksPage() {
  return (
    // FIX: Added max-w-[1600px] and mx-auto for a balanced, premium desktop layout
    <div className="mx-auto flex h-full w-full max-w-400 flex-col">
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
          Task Management
        </h2>
        <p className="text-base font-medium text-text-secondary">
          Manage your daily goals, track overdue items, and plan ahead.
        </p>
      </div>

      {/* FIX: Increased gap from gap-6 to gap-8 for breathing room */}
      <div className="grid flex-1 grid-cols-1 items-start gap-8 pb-12 xl:grid-cols-3">
        <TodayTasksCard />
        <OverdueTasksCard />
        <UpcomingTasksCard />
      </div>
    </div>
  );
}
