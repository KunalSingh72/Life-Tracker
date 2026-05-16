/**
 * Normalizes a date to midnight (00:00:00) for accurate day comparisons.
 */
export const startOfDay = (date: Date | string | number): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const isToday = (date: string): boolean => {
  const today = startOfDay(new Date());
  const compareDate = startOfDay(date);
  return today.getTime() === compareDate.getTime();
};

export const isPast = (date: string): boolean => {
  const today = startOfDay(new Date());
  const compareDate = startOfDay(date);
  return compareDate.getTime() < today.getTime();
};

export const isFuture = (date: string): boolean => {
  const today = startOfDay(new Date());
  const compareDate = startOfDay(date);
  return compareDate.getTime() > today.getTime();
};

/**
 * Formats a past date into a categorized string (e.g., "Yesterday", "May 11")
 */
export const formatOverdueCategory = (dateString: string): string => {
  const date = startOfDay(dateString);
  const today = startOfDay(new Date());
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Yesterday";
  
  return new Intl.DateTimeFormat("en-US", { 
    month: "short", 
    day: "numeric" 
  }).format(date);
};

/**
 * Formats a future date (e.g., "Tomorrow", "May 16")
 */
export const formatUpcomingDate = (dateString: string): string => {
  const date = startOfDay(dateString);
  const today = startOfDay(new Date());
  const diffTime = Math.abs(date.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Tomorrow";

  return new Intl.DateTimeFormat("en-US", { 
    month: "short", 
    day: "numeric" 
  }).format(date);
};