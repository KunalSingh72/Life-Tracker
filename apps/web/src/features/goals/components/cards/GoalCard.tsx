import {
  Calendar,
  Flag,
  ListTree,
  MoreVertical,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { Goal } from "@life-tracker/types";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  goal: Goal;
  onClick: (goalId: string) => void;
  onEditRequest: (goalId: string) => void;
  layout?: "grid" | "list";
}

export default function GoalCard({
  goal,
  onClick,
  onEditRequest,
  layout = "grid",
}: GoalCardProps) {
  const formattedDate = goal.targetDate
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(goal.targetDate))
    : "No deadline";

  const priorityStyles = {
    high: "text-red-500 bg-red-500/10 border-red-500/20",
    medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    low: "text-green-500 bg-green-500/10 border-green-500/20",
  };

  const getColorAccent = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-500";
      case "blue":
        return "bg-blue-500";
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-500";
      case "purple":
        return "bg-purple-500";
      default:
        return "bg-border";
    }
  };

  // FIX: Issue #7 (Visual Deadline Urgency Logic)
  const getUrgencyState = () => {
    if (!goal.targetDate || goal.progress === 100 || goal.status === "archived")
      return "normal";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(goal.targetDate);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "overdue";
    if (diffDays <= 3) return "approaching";
    return "normal";
  };

  const urgency = getUrgencyState();

  // ==========================================
  // LIST VIEW LAYOUT
  // ==========================================
  if (layout === "list") {
    return (
      <div
        onClick={() => onClick(goal.id)}
        className={cn(
          "group relative flex min-h-[4.5rem] w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl border bg-bg-card pr-4 pl-5 shadow-sm transition-all duration-200 hover:bg-bg-main/30 hover:shadow-md",
          urgency === "overdue"
            ? "border-red-500/50 hover:border-red-500"
            : "border-border hover:border-primary/40",
        )}
      >
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-1.5 transition-colors group-hover:bg-primary",
            getColorAccent(goal.color),
          )}
        />

        <div className="flex w-full items-center gap-4 md:gap-8 pl-2">
          <div className="flex flex-1 flex-col justify-center gap-1 truncate">
            <h3 className="truncate text-base font-bold leading-tight text-text-primary">
              {goal.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                {goal.category}
              </span>
              {urgency === "overdue" && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                  <AlertCircle className="h-3 w-3" /> Overdue
                </span>
              )}
              {urgency === "approaching" && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-500">
                  <Clock className="h-3 w-3" /> Due Soon
                </span>
              )}
            </div>
          </div>

          <div className="hidden w-32 shrink-0 flex-col gap-1.5 md:flex lg:w-48">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
              <span className="text-text-secondary">Progress</span>
              <span
                className={
                  goal.progress === 100 ? "text-green-500" : "text-primary"
                }
              >
                {goal.progress}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-main border border-border/50">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  goal.progress === 100 ? "bg-green-500" : "bg-primary",
                )}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-4 text-xs font-bold text-text-secondary sm:flex">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 border",
                priorityStyles[goal.priority],
              )}
            >
              <Flag className="h-3 w-3" />
              <span className="capitalize hidden lg:inline">
                {goal.priority}
              </span>
            </div>
            <div
              className={cn(
                "flex w-24 items-center gap-1.5 justify-end",
                urgency === "overdue" && "text-red-500",
                urgency === "approaching" && "text-yellow-500",
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className="truncate">
                {goal.targetDate
                  ? new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                    }).format(new Date(goal.targetDate))
                  : "No Date"}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditRequest(goal.id);
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary opacity-0 transition-colors hover:bg-bg-main hover:text-text-primary group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // GRID VIEW LAYOUT
  // ==========================================
  return (
    <div
      onClick={() => onClick(goal.id)}
      className={cn(
        "group relative flex h-full min-h-[14rem] cursor-pointer flex-col overflow-hidden rounded-2xl border bg-bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        urgency === "overdue"
          ? "border-red-500/50 hover:border-red-500"
          : "border-border hover:border-primary/40",
      )}
    >
      <div
        className={cn(
          "h-1.5 w-full transition-colors group-hover:bg-primary",
          getColorAccent(goal.color),
        )}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-bg-main px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary border border-border">
              {goal.category}
            </span>
            {urgency === "overdue" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 border border-red-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                <AlertCircle className="h-3 w-3" /> Overdue
              </span>
            )}
            {urgency === "approaching" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-500">
                <Clock className="h-3 w-3" /> Soon
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditRequest(goal.id);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-main hover:text-text-primary opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mb-1 break-words text-xl font-bold leading-tight text-text-primary line-clamp-2">
          {goal.title}
        </h3>

        <p className="mb-6 flex-1 break-words text-sm font-medium text-text-secondary line-clamp-2 min-h-[2.5rem]">
          {goal.description || (
            <span className="italic opacity-50">
              No description provided...
            </span>
          )}
        </p>

        <div className="mb-5 mt-auto flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="text-text-primary">Progress</span>
            <span
              className={cn(
                "transition-colors",
                goal.progress === 100 ? "text-green-500" : "text-primary",
              )}
            >
              {goal.progress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-bg-main border border-border/50">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                goal.progress === 100 ? "bg-green-500" : "bg-primary",
                urgency === "overdue" && goal.progress < 100
                  ? "bg-red-500"
                  : "",
              )}
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border/50 pt-4 text-xs font-bold text-text-secondary">
          <div className="flex items-center gap-1.5 rounded-md bg-bg-main px-2 py-1 border border-transparent">
            <ListTree className="h-3.5 w-3.5" />
            <span>{goal.milestones.length}</span>
          </div>

          <div
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 border",
              priorityStyles[goal.priority],
            )}
          >
            <Flag className="h-3.5 w-3.5" />
            <span className="capitalize">{goal.priority}</span>
          </div>

          <div
            className={cn(
              "ml-auto flex items-center gap-1.5",
              urgency === "overdue"
                ? "text-red-500"
                : urgency === "approaching"
                  ? "text-yellow-500"
                  : "text-text-secondary/80",
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
