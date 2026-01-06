import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPhaseInfo, getPhaseColor } from "@/lib/cycleUtils";
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

export function PhaseCard({ phase, currentDay, cycleLength, daysUntilNextPeriod, isInPMS }: PhaseCardProps) {
  const phaseInfo = getPhaseInfo(phase);
  const PhaseIcon = phaseIcons[phase];

  return (
    <Card className={`bg-card border-card-border overflow-hidden`}>
      <div className={`h-2 ${getPhaseColor(phase)}`} />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${getPhaseColor(phase)} flex items-center justify-center`}>
              <PhaseIcon className="w-6 h-6 text-[#4A3C3B]" />
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
              <Badge variant="secondary" className="text-xs">
                PMS Window
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
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
                <span className="text-primary mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
