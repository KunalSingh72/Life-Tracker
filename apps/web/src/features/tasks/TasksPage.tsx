import TodayTasksCard from "./components/cards/TodayTasksCard";
import OverdueTasksCard from "./components/cards/OverdueTasksCard";
import UpcomingTasksCard from "./components/cards/UpcomingTasksCard";

export default function TasksPage() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-text-primary">
          Task Management
        </h2>
        <p className="text-text-secondary font-medium">
          Manage your daily goals, track overdue items, and plan ahead.
        </p>
      </div>

      {/* Responsive Fluid Grid
        Uses full width and flex-1 to push to the bottom of the container. 
        items-start ensures cards don't stretch vertically.
      */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 items-start pb-8">
        <TodayTasksCard />
        <OverdueTasksCard />
        <UpcomingTasksCard />
      </div>
    </div>
  );
}
