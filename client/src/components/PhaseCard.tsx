import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPhaseInfo } from "@/lib/cycleUtils";
import type { MenstrualPhase } from "@shared/schema";
import { Moon, Sun, Sparkles, Leaf } from "lucide-react";

interface PhaseCardProps {
  phase: MenstrualPhase;
  currentDay: number;
  cycleLength: number;
  daysUntilNextPeriod: number;
  isInPMS: boolean;
}

const phaseIcons = {
  menstrual: Moon,
  follicular: Sun,
  ovulation: Sparkles,
  luteal: Leaf,
};

const phaseNames = {
  menstrual: "Menstrual Phase",
  follicular: "Follicular Phase",
  ovulation: "Ovulation Phase",
  luteal: "Luteal Phase",
};

const PHASE_COLORS = {
  menstrual: {
    bg: "#9B4B5B",
    light: "#9B4B5B30",
    iconBg: "#9B4B5B",
  },
  follicular: {
    bg: "#D4B896",
    light: "#D4B89630",
    iconBg: "#D4B896",
  },
  ovulation: {
    bg: "#D4956A",
    light: "#D4956A30",
    iconBg: "#D4956A",
  },
  luteal: {
    bg: "#8B6B5E",
    light: "#8B6B5E30",
    iconBg: "#8B6B5E",
  },
};

export function PhaseCard({ phase, currentDay, cycleLength, daysUntilNextPeriod, isInPMS }: PhaseCardProps) {
  const phaseInfo = getPhaseInfo(phase);
  const PhaseIcon = phaseIcons[phase];
  const colors = PHASE_COLORS[phase];

  return (
    <Card className="bg-card border-card-border overflow-hidden shadow-lg">
      <div className="h-2" style={{ backgroundColor: colors.bg }} />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md"
              style={{ backgroundColor: colors.iconBg }}
            >
              <PhaseIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <CardTitle className="font-serif text-xl text-foreground">
                {phaseNames[phase]}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Day {currentDay} of {cycleLength}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isInPMS && (
              <Badge 
                className="text-xs border-0"
                style={{ backgroundColor: '#D4956A40', color: '#D4956A' }}
              >
                PMS Window
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ borderColor: colors.bg, color: colors.bg }}
            >
              {daysUntilNextPeriod} days until period
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground mb-4">{phaseInfo.description}</p>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Tips for this phase:</h4>
          <ul className="space-y-1.5">
            {phaseInfo.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span style={{ color: colors.bg }} className="mt-0.5 text-lg">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
