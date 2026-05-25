import { useState, useEffect } from "react";
import {
  Plus,
  Target,
  LayoutGrid,
  List,
  Archive,
  CheckCircle2,
  Filter,
  XCircle,
} from "lucide-react";
import { useGoalsStore } from "./store/goals.store";
import GoalEditorModal from "./components/GoalEditorModal";
import GoalCard from "./components/cards/GoalCard";
import GoalDetailPage from "./GoalDetailPage";
import { cn } from "@/lib/utils";
import type { GoalCategory, GoalPriority } from "@life-tracker/types";

type TabView = "active" | "completed" | "archived";

export default function GoalsPage() {
  const { goals } = useGoalsStore();

  // Persistent Layout View
  const [view, setView] = useState<"grid" | "list">(() => {
    return (
      (localStorage.getItem("lifetracker-goals-view") as "grid" | "list") ||
      "grid"
    );
  });

  // FIX: Issue #9 (Completed Goals Management Tab State)
  const [activeTab, setActiveTab] = useState<TabView>("active");

  // FIX: Issue #16 (Advanced Filtering State)
  const [categoryFilter, setCategoryFilter] = useState<"all" | GoalCategory>(
    "all",
  );
  const [priorityFilter, setPriorityFilter] = useState<"all" | GoalPriority>(
    "all",
  );

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("lifetracker-goals-view", view);
  }, [view]);

  const handleCreateGoalClick = () => {
    setEditingGoalId(null);
    setIsEditorOpen(true);
  };

  const handleEditRequest = (id: string) => {
    setEditingGoalId(id);
    setIsEditorOpen(true);
  };

  const clearFilters = () => {
    setCategoryFilter("all");
    setPriorityFilter("all");
  };

  // ==========================================
  // MASTER FILTERING ENGINE
  // ==========================================
  const displayedGoals = goals.filter((goal) => {
    // 1. Status Bucket Filter (Active vs Completed vs Archived)
    if (activeTab === "archived") {
      if (goal.status !== "archived") return false;
    } else if (activeTab === "completed") {
      if (goal.status === "archived" || goal.progress !== 100) return false;
    } else {
      // "active" bucket
      if (goal.status === "archived" || goal.progress === 100) return false;
    }

    // 2. User-Selected Dropdown Filters
    if (categoryFilter !== "all" && goal.category !== categoryFilter)
      return false;
    if (priorityFilter !== "all" && goal.priority !== priorityFilter)
      return false;

    return true;
  });

  const isFiltering = categoryFilter !== "all" || priorityFilter !== "all";

  // Detail View Intercept
  if (selectedGoalId) {
    return (
      <>
        <GoalDetailPage
          goalId={selectedGoalId}
          onBack={() => setSelectedGoalId(null)}
          onEditRequest={handleEditRequest}
        />
        <GoalEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          editGoalId={editingGoalId}
        />
      </>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col relative animate-in fade-in duration-300">
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
            {activeTab === "archived"
              ? "Archived Goals"
              : activeTab === "completed"
                ? "Completed Goals"
                : "Goals & Milestones"}
          </h2>
          <p className="text-base font-medium text-text-secondary">
            {activeTab === "archived"
              ? "Review past ambitions and on-hold journeys."
              : activeTab === "completed"
                ? "Look back at the summits you have successfully conquered."
                : "Define your long-term ambitions, track progress, and build your roadmap."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {activeTab !== "archived" && (
            <button
              onClick={handleCreateGoalClick}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-primary/90"
            >
              <Plus className="h-4.5 w-4.5" />
              Create Goal
            </button>
          )}
        </div>
      </div>

      {/* FILTER & CONTROL BAR */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-border bg-bg-card p-2 shadow-sm">
        {/* Top-Level Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-bg-main p-1 border border-border overflow-x-auto custom-scrollbar">
          {(["active", "completed", "archived"] as TabView[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold capitalize transition-all",
                activeTab === tab
                  ? "bg-bg-card text-primary shadow-sm ring-1 ring-border"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-card/50",
              )}
            >
              {tab === "active" && <Target className="h-4 w-4" />}
              {tab === "completed" && <CheckCircle2 className="h-4 w-4" />}
              {tab === "archived" && <Archive className="h-4 w-4" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Dropdown Filters & Layout Toggles */}
        <div className="flex items-center gap-3 px-2 lg:px-0 flex-wrap">
          <div className="flex items-center gap-2 mr-2">
            <Filter className="h-4 w-4 text-text-secondary" />
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as "all" | GoalCategory)
              }
              className="h-9 cursor-pointer rounded-lg border border-border bg-bg-main px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
              <option value="learning">Learning</option>
              <option value="other">Other</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as "all" | GoalPriority)
              }
              className="h-9 cursor-pointer rounded-lg border border-border bg-bg-main px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {isFiltering && (
              <button
                onClick={clearFilters}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-xs font-bold text-red-500 transition-colors hover:bg-red-500/20"
              >
                <XCircle className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>

          <div className="hidden h-6 w-px bg-border lg:block" />

          {/* Grid / List Toggles */}
          <div className="hidden items-center gap-1 rounded-xl border border-border bg-bg-main p-1 md:flex">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "rounded-lg p-1.5 transition-all duration-200",
                view === "grid"
                  ? "bg-bg-card text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "rounded-lg p-1.5 transition-all duration-200",
                view === "list"
                  ? "bg-bg-card text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RENDERED CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-12">
        {displayedGoals.length === 0 ? (
          <div className="flex h-[50vh] min-h-[300px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-bg-card/30 text-center transition-all hover:bg-bg-card/50 px-4">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              {isFiltering ? (
                <Filter className="h-8 w-8" />
              ) : activeTab === "completed" ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : activeTab === "archived" ? (
                <Archive className="h-8 w-8" />
              ) : (
                <Target className="h-8 w-8" />
              )}
            </div>
            <h3 className="mb-2 text-xl font-bold text-text-primary">
              {isFiltering
                ? "No goals match your filters"
                : activeTab === "completed"
                  ? "No completed goals yet"
                  : activeTab === "archived"
                    ? "No archived goals"
                    : "No active goals"}
            </h3>
            <p className="max-w-md text-sm font-medium text-text-secondary leading-relaxed">
              {isFiltering
                ? "Try adjusting your category or priority settings to see more results."
                : activeTab === "completed"
                  ? "Complete your active goals to see them immortalized here!"
                  : activeTab === "archived"
                    ? "You haven't put any goals on hold. Keep pushing forward!"
                    : "Every great journey starts with a single step. Create your first goal to begin."}
            </p>
            {isFiltering ? (
              <button
                onClick={clearFilters}
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-bg-main border border-border px-6 py-2.5 text-sm font-bold text-text-primary shadow-sm transition-all hover:border-red-500/50 hover:text-red-500"
              >
                <XCircle className="h-4.5 w-4.5" /> Clear Filters
              </button>
            ) : activeTab === "active" ? (
              <button
                onClick={handleCreateGoalClick}
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-bg-main border border-border px-6 py-2.5 text-sm font-bold text-text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
              >
                <Plus className="h-4.5 w-4.5" /> Define First Goal
              </button>
            ) : null}
          </div>
        ) : (
          <div
            className={cn(
              "transition-all duration-300",
              view === "grid"
                ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                : "flex flex-col gap-3 max-w-4xl",
            )}
          >
            {displayedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                layout={view}
                onClick={(id) => setSelectedGoalId(id)}
                onEditRequest={handleEditRequest}
              />
            ))}
          </div>
        )}
      </div>

      <GoalEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        editGoalId={editingGoalId}
      />
    </div>
  );
}
