import { useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { Sun, Moon, ChevronDown } from "lucide-react";
import UpcomingEvents from "./UpcomingEvents";
import Notifications from "./Notifications";
import Reminders from "./Reminders"; // NEW IMPORT

const MockAvatar = () => (
  <div className="h-10 w-10 rounded-full border border-border bg-text-secondary/10 p-0.5 shadow-inner">
    <img
      src="https://randomuser.me/api/portraits/men/34.jpg"
      alt="User"
      className="h-full w-full rounded-full object-cover"
    />
  </div>
);

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "To-do",
  "/notes": "Notes",
  "/goals": "Goals",
  "/budget": "Budget Tracker",
  "/health": "Health & Calories",
  "/settings": "Settings",
};

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const pageTitle = routeTitles[location.pathname] || "My Life";

  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-bg-card px-8">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">
        {pageTitle}
      </h1>

      <div className="flex items-center gap-5">
        <UpcomingEvents />

        <div className="flex items-center gap-2">
          <Reminders />

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <Notifications />
        </div>

        <div className="flex items-center gap-4 border-l border-border pl-5">
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary">
              Mark Zuckerburg
            </p>
            <p className="text-xs text-text-secondary">Premium</p>
          </div>
          <button className="flex items-center gap-2">
            <MockAvatar />
            <ChevronDown className="h-4 w-4 text-text-secondary" />
          </button>
        </div>
      </div>
    </header>
  );
}
