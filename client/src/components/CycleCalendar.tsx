import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { generateCalendarDays } from "@/lib/cycleUtils";
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

const PHASE_COLORS = {
  menstrual: {
    bg: "bg-[#9B4B5B]",
    border: "border-[#9B4B5B]",
    text: "text-[#9B4B5B]",
    light: "bg-[#9B4B5B]/20",
    hex: "#9B4B5B",
    name: "Menstrual",
    showDot: true
  },
  follicular: {
    bg: "bg-[#E8D5B7]",
    border: "border-[#E8D5B7]",
    text: "text-[#E8D5B7]",
    light: "bg-[#E8D5B7]/25",
    hex: "#E8D5B7",
    name: "Follicular",
    showDot: false
  },
  ovulation: {
    bg: "bg-[#F5C69A]",
    border: "border-[#F5C69A]",
    text: "text-[#F5C69A]",
    light: "bg-[#F5C69A]/25",
    hex: "#F5C69A",
    name: "Ovulation",
    showDot: false
  },
  luteal: {
    bg: "bg-[#C9A89A]",
    border: "border-[#C9A89A]",
    text: "text-[#C9A89A]",
    light: "bg-[#C9A89A]/25",
    hex: "#C9A89A",
    name: "Luteal",
    showDot: false
  }
};

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

  const getPhaseStyle = (phase: MenstrualPhase | null) => {
    if (!phase) return { bg: "", border: "" };
    return PHASE_COLORS[phase];
  };

  return (
    <Card className="bg-card border-card-border shadow-lg">
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
              className="hover:bg-primary/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              data-testid="button-today"
              className="border-primary/50 hover:bg-primary/20"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              data-testid="button-next-month"
              className="hover:bg-primary/20"
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
          {calendarDays.map((day, index) => {
            const phaseStyle = getPhaseStyle(day.phase);
            return (
              <button
                key={index}
                onClick={() => onDateClick?.(day.date)}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5
                  text-sm transition-all duration-200 relative
                  ${day.phase ? `${phaseStyle.light} border-2 ${phaseStyle.border}` : "hover:bg-accent/50"}
                  ${day.isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md" : ""}
                  ${day.isPredicted ? "opacity-70" : ""}
                `}
                style={day.phase ? { 
                  backgroundColor: `${phaseStyle.hex}20`,
                  borderColor: phaseStyle.hex
                } : {}}
                data-testid={`calendar-day-${day.date.getDate()}`}
              >
                <span className={`${day.isToday ? "font-bold" : ""} text-foreground`}>
                  {day.date.getDate()}
                </span>
                {day.phase && phaseStyle.showDot && (
                  <div
                    className="w-2 h-2 rounded-full shadow-sm"
                    style={{ backgroundColor: phaseStyle.hex }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-3">Cycle Phases</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(PHASE_COLORS).map(([phase, colors]) => (
              <div 
                key={phase} 
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{ backgroundColor: `${colors.hex}15` }}
              >
                <div 
                  className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                  style={{ backgroundColor: colors.hex }}
                />
                <span className="text-xs text-foreground font-medium">{colors.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
