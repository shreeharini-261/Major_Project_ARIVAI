import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SYMPTOM_TYPES, type SymptomType } from "@shared/schema";
import { Plus, X } from "lucide-react";

const symptomLabels: Record<SymptomType, string> = {
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

interface SymptomLoggerProps {
  onClose?: () => void;
}

export function SymptomLogger({ onClose }: SymptomLoggerProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([]);
  const [severity, setSeverity] = useState<number>(3);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logSymptomMutation = useMutation({
    mutationFn: async (symptoms: { symptomType: SymptomType; severity: number; notes: string }[]) => {
      const response = await apiRequest("POST", "/api/symptoms", { symptoms });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
      toast({
        title: "Symptoms logged",
        description: "Your symptoms have been recorded successfully.",
      });
      setSelectedSymptoms([]);
      setSeverity(3);
      setNotes("");
      onClose?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log symptoms",
        variant: "destructive",
      });
    },
  });

  const toggleSymptom = (symptom: SymptomType) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    if (selectedSymptoms.length === 0) {
      toast({
        title: "No symptoms selected",
        description: "Please select at least one symptom to log.",
        variant: "destructive",
      });
      return;
    }

    const symptoms = selectedSymptoms.map((symptom) => ({
      symptomType: symptom,
      severity,
      notes,
    }));

    logSymptomMutation.mutate(symptoms);
  };

  const getSeverityLabel = (value: number): string => {
    const labels = ["Mild", "Light", "Moderate", "Strong", "Severe"];
    return labels[value - 1] || "Moderate";
  };

  return (
    <Card className="bg-card border-card-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-serif text-lg text-foreground">
            Log Today's Symptoms
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-symptom-logger">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-3">Select symptoms you're experiencing:</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_TYPES.map((symptom) => (
              <Badge
                key={symptom}
                variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                className={`cursor-pointer transition-all ${
                  selectedSymptoms.includes(symptom) ? "bg-primary" : ""
                }`}
                onClick={() => toggleSymptom(symptom)}
                data-testid={`symptom-${symptom}`}
              >
                {symptomLabels[symptom]}
              </Badge>
            ))}
          </div>
        </div>

        {selectedSymptoms.length > 0 && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">Severity</label>
                <span className="text-sm text-primary font-medium">
                  {getSeverityLabel(severity)}
                </span>
              </div>
              <Slider
                value={[severity]}
                onValueChange={(value) => setSeverity(value[0])}
                min={1}
                max={5}
                step={1}
                className="w-full"
                data-testid="slider-severity"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mild</span>
                <span>Severe</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-foreground">Notes (optional)</label>
              <Textarea
                placeholder="Add any additional notes about how you're feeling..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none bg-background border-border"
                rows={3}
                data-testid="textarea-notes"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={logSymptomMutation.isPending}
              data-testid="button-log-symptoms"
            >
              {logSymptomMutation.isPending ? (
                "Logging..."
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Symptoms
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
