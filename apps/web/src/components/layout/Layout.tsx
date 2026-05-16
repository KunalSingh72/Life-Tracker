import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ScheduleModal from "@/features/tasks/components/ScheduleModal";

function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-main text-text-primary">
      {/* Side Navigations - Fixed width, full height */}
      <Sidebar />

      {/* Main Content Container - column layout */}
      <div className="flex-1 flex flex-col h-full relative">
        <Topbar />

        {/* Dynamic Page View - Scrollable vertical area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <ScheduleModal />
    </div>
  );
}

export default Layout;
