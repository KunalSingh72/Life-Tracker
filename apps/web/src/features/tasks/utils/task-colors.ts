import type { TaskPriority } from "@life-tracker/types";

export const getPriorityColors = (priority: TaskPriority) => {
  switch (priority) {
    case "high":
      return {
        bg: "bg-red-500/10",
        border: "border-red-500",
        text: "text-red-500",
        indicator: "bg-red-500",
      };
    case "medium":
      return {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500",
        text: "text-yellow-600",
        indicator: "bg-yellow-500",
      };
    case "low":
    default:
      return {
        bg: "bg-green-500/10",
        border: "border-green-500",
        text: "text-green-500",
        indicator: "bg-green-500",
      };
  }
};