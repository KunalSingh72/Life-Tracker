import { Calendar } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";

export default function UpcomingEvents() {
  const openScheduleModal = useUIStore((state) => state.openScheduleModal);

  return (
    <button
      onClick={openScheduleModal}
      className="flex items-center gap-3.5 rounded-full border border-border bg-bg-main px-5 py-3 shadow-sm transition-all hover:border-primary/50 hover:text-text-primary text-text-secondary"
    >
      <Calendar className="h-5 w-5" />
      <span className="text-sm font-medium">Calendar</span>
    </button>
  );
}
