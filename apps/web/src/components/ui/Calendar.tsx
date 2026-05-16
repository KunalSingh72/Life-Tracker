import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  renderDayMarkers?: (date: Date, isSelected: boolean) => React.ReactNode; 
}
export function Calendar({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  renderDayMarkers,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();

  const prevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );

  const isDateDisabled = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day).setHours(0, 0, 0, 0);
    const min = minDate ? new Date(minDate).setHours(0, 0, 0, 0) : null;
    const max = maxDate ? new Date(maxDate).setHours(0, 0, 0, 0) : null;
    if (min !== null && date < min) return true;
    if (max !== null && date > max) return true;
    return false;
  };

  const isDateSelected = (year: number, month: number, day: number) => {
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
  };

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="w-full select-none rounded-xl border border-border bg-bg-main p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between px-2">
        <button
          onClick={prevMonth}
          className="rounded-md p-1 text-text-secondary transition-colors hover:bg-bg-card hover:text-text-primary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-bold text-text-primary">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={nextMonth}
          className="rounded-md p-1 text-text-secondary transition-colors hover:bg-bg-card hover:text-text-primary"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Grid Header */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center">
        {days.map((day) => (
          <div
            key={day}
            className="py-1 text-xs font-semibold text-text-secondary"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateObj = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day,
          );
          const disabled = isDateDisabled(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day,
          );
          const selected = isDateSelected(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day,
          );
          const today = isToday(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day,
          );

          return (
            <div
              key={day}
              className="relative flex h-10 w-full flex-col items-center justify-center"
            >
              <button
                disabled={disabled}
                onClick={() => onDateSelect(dateObj)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all",
                  disabled && "cursor-not-allowed text-text-secondary/30",
                  !disabled &&
                    !selected &&
                    "text-text-primary hover:bg-bg-card",
                  selected && "bg-primary font-bold text-white shadow-md",
                  today && !selected && "border border-primary text-primary",
                )}
              >
                {day}
              </button>

              {/* Pass the 'selected' variable to the marker function */}
              <div className="absolute bottom-0.5 flex w-full justify-center">
                {renderDayMarkers?.(dateObj, selected)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
