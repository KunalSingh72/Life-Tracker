import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Wallet, 
  HeartPulse, 
  FileText 
} from "lucide-react";

export const NAVIGATION_LINKS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Notes", href: "/notes", icon: FileText },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Budget", href: "/budget", icon: Wallet },
  { name: "Health", href: "/health", icon: HeartPulse },
];