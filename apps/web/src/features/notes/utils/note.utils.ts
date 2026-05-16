import type { NoteColor } from "@life-tracker/types";

/**
 * Safely strips HTML tags from a string to generate a plain-text preview.
 */
export const extractPreviewText = (html: string): string => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

/**
 * Formats a generic date string into a clean "15 May" format.
 */
export const formatNoteDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
};

/**
 * Maps the NoteColor type to our design system's Tailwind classes.
 */
export const getNoteColorClasses = (color: NoteColor) => {
  switch (color) {
    case "red":
      return "bg-red-500/5 border-red-500/20 hover:border-red-500/40";
    case "blue":
      return "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40";
    case "green":
      return "bg-green-500/5 border-green-500/20 hover:border-green-500/40";
    case "yellow":
      return "bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40";
    case "purple":
      return "bg-purple-500/5 border-purple-500/20 hover:border-purple-500/40";
    case "default":
    default:
      return "bg-bg-card border-border hover:border-primary/40";
  }
};