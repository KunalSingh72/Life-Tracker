import { 
  LayoutDashboard, 
  CheckSquare, 
  Goal, 
  Wallet, 
  HeartPulse, 
  FileText,
  CalendarDays 
} from "lucide-react";

export const NAVIGATION_LINKS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Calendar", href: "/calendar", icon: CalendarDays }, 
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Notes", href: "/notes", icon: FileText },
  { name: "Goals", href: "/goals", icon: Goal },
  { name: "Budget", href: "/budget", icon: Wallet },
  { name: "Health", href: "/health", icon: HeartPulse },
];