import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  ClipboardList,
  MessageSquareText,
  Goal,
  Landmark,
  HandHeart,
  Settings,
  LogOut,
} from "lucide-react";


const Logo = () => (
  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 p-1.5 shadow-md">
    <div className="relative h-full w-full">
      <div className="absolute left-0 top-0 h-4 w-4 rounded-full bg-cyan-400 opacity-80" />
      <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-pink-400 opacity-80" />
    </div>
  </div>
);

const navItemsUpper = [
  { name: "Dashboard", path: "/", icon: LayoutGrid },
  { name: "To-Do", path: "/tasks", icon: ClipboardList },
  { name: "Notes", path: "/notes", icon: MessageSquareText },
  { name: "Goals", path: "/goals", icon: Goal },
  { name: "Budget Tracker", path: "/budget", icon: Landmark },
  { name: "Calories", path: "/health", icon: HandHeart },
];

const navItemsLower = [
  { name: "Settings", path: "/settings", icon: Settings },
  { name: "Sign Out", path: "/signout", icon: LogOut },
];

export default function Sidebar() {
  const activeClass =
    "flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-inner";
  const inactiveClass =
    "flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-main/50 transition-all";

  return (
    <aside className="flex h-screen w-65 flex-col border-r border-border bg-bg-sidebar p-6">
      {/* Branding */}
      <div className="flex items-center gap-3.5 pb-10">
        <Logo />
        <span className="text-xl font-bold text-text-primary tracking-tight">
          LifeTracker
        </span>
      </div>
      

      {/* Upper Navigation */}
      <nav className="flex-1 space-y-2">
        {navItemsUpper.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? activeClass : inactiveClass
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}

        <div className="py-4 border-b border-border" />

        {/* Lower Navigation (Settings/Logout) */}
        <div className="pt-4 space-y-2">
          {navItemsLower.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? activeClass : inactiveClass
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}
