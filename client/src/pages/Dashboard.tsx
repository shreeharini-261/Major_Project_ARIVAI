import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { CycleCalendar } from "@/components/CycleCalendar";
import { PhaseCard } from "@/components/PhaseCard";
import { SymptomLogger } from "@/components/SymptomLogger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateCycleInfo, formatDate } from "@/lib/cycleUtils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Cycle, Symptom } from "@shared/schema";
import { Calendar, Plus, Activity, TrendingUp, Clock, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSymptomLogger, setShowSymptomLogger] = useState(false);
  const [periodStartDialog, setPeriodStartDialog] = useState(false);
  const [newPeriodDate, setNewPeriodDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: cycles, isLoading: cyclesLoading } = useQuery<Cycle[]>({
    queryKey: ["/api/cycles"],
  });

  const { data: symptoms, isLoading: symptomsLoading } = useQuery<Symptom[]>({
    queryKey: ["/api/symptoms"],
  });

  const startPeriodMutation = useMutation({
    mutationFn: async (startDate: string) => {
      const response = await apiRequest("POST", "/api/cycles", { startDate });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cycles"] });
      toast({
        title: "Period started",
        description: "Your new cycle has been recorded.",
      });
      setPeriodStartDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start period",
        variant: "destructive",
      });
    },
  });

  const latestCycle = cycles?.[0];
  const cycleLength = user?.averageCycleLength || 28;
  
  const cycleInfo = latestCycle?.startDate
    ? calculateCycleInfo(latestCycle.startDate, cycleLength)
    : null;

  const recentSymptoms = symptoms?.slice(0, 5) || [];

  const symptomLabels: Record<string, string> = {
    cramps: "Cramps",
    bloating: "Bloating",
    headache: "Headache",
    fatigue: "Fatigue",
    mood_swing: "Mood Swings",
    breast_tenderness: "Breast Tenderness",
    acne: "Acne",
    cravings: "Cravings",
    nausea: "Nausea",
    back_pain: "Back Pain",
    insomnia: "Insomnia",
    anxiety: "Anxiety",
    irritability: "Irritability",
    depression: "Low Mood",
  };

  if (cyclesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Welcome back, {user?.firstName || "there"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {cycleInfo
                ? `You're on day ${cycleInfo.currentDay} of your cycle`
                : "Start tracking your cycle to get personalized insights"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {cycleInfo ? (
                <PhaseCard
                  phase={cycleInfo.phase}
                  currentDay={cycleInfo.currentDay}
                  cycleLength={cycleLength}
                  daysUntilNextPeriod={cycleInfo.daysUntilNextPeriod}
                  isInPMS={cycleInfo.isInPMS}
                />
              ) : (
                <Card className="bg-card border-card-border">
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-serif text-xl text-foreground mb-2">
                      Start Tracking Your Cycle
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Log when your last period started to get personalized phase insights and predictions.
                    </p>
                    <Dialog open={periodStartDialog} onOpenChange={setPeriodStartDialog}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-start-tracking">
                          <Plus className="w-4 h-4 mr-2" />
                          Log Period Start
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-card-border">
                        <DialogHeader>
                          <DialogTitle className="font-serif">When did your period start?</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="period-date">Start Date</Label>
                            <Input
                              id="period-date"
                              type="date"
                              value={newPeriodDate}
                              onChange={(e) => setNewPeriodDate(e.target.value)}
                              className="bg-background border-border"
                              data-testid="input-period-date"
                            />
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => startPeriodMutation.mutate(newPeriodDate)}
                            disabled={startPeriodMutation.isPending}
                            data-testid="button-confirm-period"
                          >
                            {startPeriodMutation.isPending ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-card border-card-border hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cycle Length</p>
                        <p className="text-lg font-semibold text-foreground">{cycleLength} days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-card-border hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Period</p>
                        <p className="text-lg font-semibold text-foreground">
                          {cycleInfo ? formatDate(cycleInfo.nextPeriodDate) : "—"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-card-border hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ovulation Day</p>
                        <p className="text-lg font-semibold text-foreground">
                          {cycleInfo ? `Day ${cycleInfo.ovulationDay}` : "—"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {showSymptomLogger ? (
                <SymptomLogger onClose={() => setShowSymptomLogger(false)} />
              ) : (
                <Card className="bg-card border-card-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="font-serif text-lg text-foreground flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Recent Symptoms
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSymptomLogger(true)}
                        data-testid="button-log-symptom"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Log Symptoms
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {recentSymptoms.length > 0 ? (
                      <div className="space-y-2">
                        {recentSymptoms.map((symptom, index) => (
                          <div
                            key={symptom.id || index}
                            className="flex items-center justify-between py-2 border-b border-border last:border-0"
                          >
                            <div>
                              <p className="text-foreground">
                                {symptomLabels[symptom.symptomType] || symptom.symptomType}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {symptom.date ? formatDate(symptom.date) : "Today"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: symptom.severity || 1 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-2 h-2 rounded-full bg-primary"
                                />
                              ))}
                              {Array.from({ length: 5 - (symptom.severity || 1) }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-2 h-2 rounded-full bg-muted"
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No symptoms logged yet. Start tracking to see patterns.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <CycleCalendar
                lastPeriodStart={latestCycle?.startDate ? new Date(latestCycle.startDate) : null}
                cycleLength={cycleLength}
              />

              {cycleInfo && (
                <Dialog open={periodStartDialog} onOpenChange={setPeriodStartDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline" data-testid="button-period-started">
                      <Plus className="w-4 h-4 mr-2" />
                      My Period Started
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-card-border">
                    <DialogHeader>
                      <DialogTitle className="font-serif">Log New Period</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="period-date-2">Start Date</Label>
                        <Input
                          id="period-date-2"
                          type="date"
                          value={newPeriodDate}
                          onChange={(e) => setNewPeriodDate(e.target.value)}
                          className="bg-background border-border"
                          data-testid="input-new-period-date"
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => startPeriodMutation.mutate(newPeriodDate)}
                        disabled={startPeriodMutation.isPending}
                        data-testid="button-confirm-new-period"
                      >
                        {startPeriodMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
