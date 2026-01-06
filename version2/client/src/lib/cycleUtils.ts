import type { MenstrualPhase, Cycle } from "@shared/schema";

export interface CycleInfo {
  currentDay: number;
  phase: MenstrualPhase;
  daysUntilNextPeriod: number;
  nextPeriodDate: Date;
  isInPMS: boolean;
  ovulationDay: number;
  pmsStartDay: number;
  phaseDescription: string;
  phaseIcon: string;
}

export function calculateCycleDay(lastPeriodStart: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(lastPeriodStart);
  start.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export function calculatePhase(cycleDay: number, cycleLength: number = 28): MenstrualPhase {
  const ovulationDay = cycleLength - 14;
  
  if (cycleDay >= 1 && cycleDay <= 5) {
    return 'menstrual';
  } else if (cycleDay >= 6 && cycleDay <= ovulationDay - 2) {
    return 'follicular';
  } else if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) {
    return 'ovulation';
  } else {
    return 'luteal';
  }
}

export function getPhaseInfo(phase: MenstrualPhase): { description: string; icon: string; tips: string[] } {
  const phaseInfo = {
    menstrual: {
      description: "Your body is shedding the uterine lining. Focus on rest and gentle self-care.",
      icon: "🌙",
      tips: [
        "Stay hydrated and eat iron-rich foods",
        "Gentle stretching or yoga can help with cramps",
        "Get extra rest when possible",
        "Apply warmth to relieve discomfort"
      ]
    },
    follicular: {
      description: "Energy levels are rising as estrogen increases. Great time for new projects!",
      icon: "🌸",
      tips: [
        "Try new workouts or activities",
        "This is a great time for social activities",
        "Focus on protein-rich foods",
        "Your skin may be clearer now"
      ]
    },
    ovulation: {
      description: "Peak fertility and energy. You may feel more social and confident.",
      icon: "✨",
      tips: [
        "Track any fertility symptoms if trying to conceive",
        "Energy is at its highest - great for intense workouts",
        "You may feel more communicative",
        "Stay aware of any mood changes"
      ]
    },
    luteal: {
      description: "Progesterone rises, preparing for menstruation. Be gentle with yourself.",
      icon: "🍂",
      tips: [
        "Complex carbs can help with cravings",
        "Magnesium-rich foods may reduce PMS symptoms",
        "Prioritize sleep and relaxation",
        "Light exercise like walking can boost mood"
      ]
    }
  };
  
  return phaseInfo[phase];
}

export function calculateCycleInfo(
  lastPeriodStart: Date | string,
  cycleLength: number = 28
): CycleInfo {
  const startDate = typeof lastPeriodStart === 'string' ? new Date(lastPeriodStart) : lastPeriodStart;
  const currentDay = calculateCycleDay(startDate);
  const phase = calculatePhase(currentDay, cycleLength);
  const phaseData = getPhaseInfo(phase);
  
  const ovulationDay = cycleLength - 14;
  const pmsStartDay = cycleLength - 7;
  const isInPMS = currentDay >= pmsStartDay && currentDay <= cycleLength;
  
  const daysUntilNextPeriod = Math.max(0, cycleLength - currentDay + 1);
  const nextPeriodDate = new Date(startDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
  
  return {
    currentDay: currentDay > cycleLength ? currentDay % cycleLength || cycleLength : currentDay,
    phase,
    daysUntilNextPeriod,
    nextPeriodDate,
    isInPMS,
    ovulationDay,
    pmsStartDay,
    phaseDescription: phaseData.description,
    phaseIcon: phaseData.icon,
  };
}

export function getPhaseColor(phase: MenstrualPhase): string {
  const colors = {
    menstrual: 'bg-[#E8B4BC]', // Soft Rose Latte
    follicular: 'bg-[#D4C4B0]', // Warm Beige Latte
    ovulation: 'bg-[#C9A9A6]', // Dusty Rose Latte
    luteal: 'bg-[#BFA89E]', // Mocha Latte
  };
  return colors[phase];
}

export function getPhaseBorderColor(phase: MenstrualPhase): string {
  const colors = {
    menstrual: 'border-[#E8B4BC]',
    follicular: 'border-[#D4C4B0]',
    ovulation: 'border-[#C9A9A6]',
    luteal: 'border-[#BFA89E]',
  };
  return colors[phase];
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function generateCalendarDays(
  year: number,
  month: number,
  lastPeriodStart: Date | null,
  cycleLength: number = 28
): Array<{ date: Date; phase: MenstrualPhase | null; isToday: boolean; isPredicted: boolean }> {
  const days: Array<{ date: Date; phase: MenstrualPhase | null; isToday: boolean; isPredicted: boolean }> = [];
  const daysInMonth = getDaysInMonth(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const isToday = date.getTime() === today.getTime();
    
    let phase: MenstrualPhase | null = null;
    let isPredicted = false;
    
    if (lastPeriodStart) {
      const cycleDay = calculateCycleDay(lastPeriodStart);
      const dayDiff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const projectedCycleDay = ((cycleDay + dayDiff - 1) % cycleLength) + 1;
      
      if (projectedCycleDay > 0 && projectedCycleDay <= cycleLength) {
        phase = calculatePhase(projectedCycleDay, cycleLength);
        isPredicted = date > today;
      }
    }
    
    days.push({ date, phase, isToday, isPredicted });
  }
  
  return days;
}
