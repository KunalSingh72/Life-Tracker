import { NavLink } from "react-router";
import { Settings, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { NAVIGATION_LINKS } from "@/config/navigation";

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-70 shrink-0 bg-background-surface flex-col transition-colors duration-200 hidden md:flex border-r border-border-subtle">
      {/* Branding Area */}
      <div className="h-24 flex items-center px-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-accent-primary grid place-items-center">
            <div className="w-3 h-3 bg-background-surface rounded-sm"></div>
          </div>
          <span className="text-xl font-bold text-text-primary">Business</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-6 space-y-2">
        {NAVIGATION_LINKS.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent-subtle text-accent-primary"
                  : "text-text-secondary hover:bg-background-main hover:text-text-primary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-accent-primary" : "text-text-secondary"
                  }`}
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-accent-subtle text-accent-primary"
                : "text-text-secondary hover:bg-background-main hover:text-text-primary"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Settings
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-accent-primary" : "text-text-secondary"
                }`}
              />
              Settings
            </>
          )}
        </NavLink>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-background-main hover:text-text-primary transition-all text-left cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          Theme
        </button>

        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-background-main hover:text-text-primary transition-all text-left cursor-pointer mt-4">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
