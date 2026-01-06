import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { generateCalendarDays, getPhaseColor } from "@/lib/cycleUtils";
import type { MenstrualPhase } from "@shared/schema";

interface CycleCalendarProps {
  lastPeriodStart: Date | null;
  cycleLength?: number;
  onDateClick?: (date: Date) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function CycleCalendar({ lastPeriodStart, cycleLength = 28, onDateClick }: CycleCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const calendarDays = generateCalendarDays(currentYear, currentMonth, lastPeriodStart, cycleLength);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const emptyDays = Array(firstDayOfMonth).fill(null);

  const getPhaseIndicatorClass = (phase: MenstrualPhase | null): string => {
    if (!phase) return "";
    const classes = {
      menstrual: "bg-[#E8B4BC]",
      follicular: "bg-[#D4C4B0]",
      ovulation: "bg-[#C9A9A6]",
      luteal: "bg-[#BFA89E]",
    };
    return classes[phase];
  };

  return (
    <Card className="bg-card border-card-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="font-serif text-xl text-foreground">
            {MONTHS[currentMonth]} {currentYear}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
              data-testid="button-prev-month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              data-testid="button-today"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              data-testid="button-next-month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => onDateClick?.(day.date)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5
                text-sm transition-all duration-200 relative
                ${day.isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                ${day.isPredicted ? "opacity-60" : ""}
                hover-elevate
              `}
              data-testid={`calendar-day-${day.date.getDate()}`}
            >
              <span className={`${day.isToday ? "font-bold text-foreground" : "text-foreground"}`}>
                {day.date.getDate()}
              </span>
              {day.phase && (
                <div
                  className={`w-1.5 h-1.5 rounded-full ${getPhaseIndicatorClass(day.phase)}`}
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-4 justify-center text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#E8B4BC]" />
              <span className="text-muted-foreground">Menstrual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#D4C4B0]" />
              <span className="text-muted-foreground">Follicular</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#C9A9A6]" />
              <span className="text-muted-foreground">Ovulation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#BFA89E]" />
              <span className="text-muted-foreground">Luteal</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
