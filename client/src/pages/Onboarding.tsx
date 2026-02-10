import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Calendar, Activity, Sparkles, ArrowRight, ArrowLeft, Check } from "lucide-react";

interface OnboardingData {
  lastPeriodDate: string;
  typicalCycleLength: string;
  periodDuration: string;
  cycleVariability: string;
  healthConditions: string[];
  fertilityTracking: string[];
  trackSymptoms: string;
  dynamicPredictions: string;
  stressLevel: string;
  sleepPattern: string;
  healthNotes: string;
}

const TOTAL_STEPS = 9;

export default function Onboarding() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    lastPeriodDate: "",
    typicalCycleLength: "",
    periodDuration: "",
    cycleVariability: "",
    healthConditions: [],
    fertilityTracking: [],
    trackSymptoms: "",
    dynamicPredictions: "",
    stressLevel: "",
    sleepPattern: "",
    healthNotes: "",
  });

  const saveMutation = useMutation({
    mutationFn: async (onboardingData: OnboardingData) => {
      const response = await apiRequest("POST", "/api/onboarding", onboardingData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cycles"] });
      toast({
        title: "Welcome to ARIVAI!",
        description: "Your profile is set up. Let's start your wellness journey!",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save your preferences",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      saveMutation.mutate(data);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "healthConditions" | "fertilityTracking", item: string) => {
    setData((prev) => {
      const current = prev[field];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter((i) => i !== item) };
      }
      return { ...prev, [field]: [...current, item] };
    });
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const stepIcons = [Calendar, Activity, Heart, Sparkles];
  const StepIcon = stepIcons[(currentStep - 1) % 4];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border-card-border shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <StepIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="font-serif text-2xl text-foreground">
            Let's personalize your experience
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Step {currentStep} of {TOTAL_STEPS}
          </CardDescription>
          <Progress value={progress} className="mt-4 h-2" />
        </CardHeader>

        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-xl text-foreground mb-2">
                      When did your last period start?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      This helps us calculate your current cycle phase
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-full max-w-xs space-y-2">
                      <Label htmlFor="lastPeriod">First day of your last period</Label>
                      <Input
                        id="lastPeriod"
                        type="date"
                        value={data.lastPeriodDate}
                        onChange={(e) => updateData("lastPeriodDate", e.target.value)}
                        className="bg-background border-border text-center text-lg"
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-xl text-foreground mb-2">
                      What's your usual cycle length?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Count from the first day of one period to the first day of the next
                    </p>
                  </div>
                  <RadioGroup
                    value={data.typicalCycleLength}
                    onValueChange={(value) => updateData("typicalCycleLength", value)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { value: "21-25", label: "21-25 days" },
                      { value: "26-30", label: "26-30 days" },
                      { value: "31-35", label: "31-35 days" },
                      { value: "36-40", label: "36-40 days" },
                      { value: ">40", label: "More than 40 days" },
                      { value: "irregular", label: "Very irregular" },
                      { value: "unknown", label: "I don't know" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          data.typicalCycleLength === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => updateData("typicalCycleLength", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-xl text-foreground mb-2">
                      How many days does your period usually last?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Count the days of bleeding
                    </p>
                  </div>
                  <RadioGroup
                    value={data.periodDuration}
                    onValueChange={(value) => updateData("periodDuration", value)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {[
                      { value: "2-4", label: "2-4 days" },
                      { value: "5-7", label: "5-7 days" },
                      { value: "8+", label: "8+ days" },
                      { value: "irregular", label: "Very irregular" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          data.periodDuration === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => updateData("periodDuration", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={`pd-${option.value}`} />
                        <Label htmlFor={`pd-${option.value}`} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-xl text-foreground mb-2">
                      Do your cycles vary month to month?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      This helps us adjust predictions for your unique pattern
                    </p>
                  </div>
                  <RadioGroup
                    value={data.cycleVariability}
                    onValueChange={(value) => updateData("cycleVariability", value)}
                    className="space-y-3"
                  >
                    {[
                      { value: "rarely", label: "Rarely", desc: "My cycles are pretty regular" },
                      { value: "sometimes", label: "Sometimes", desc: "Occasional variations" },
                      { value: "often", label: "Often", desc: "Cycles vary by more than a week" },
                      { value: "always_irregular", label: "Always irregular", desc: "Very unpredictable" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          data.cycleVariability === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => updateData("cycleVariability", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={`cv-${option.value}`} className="mt-1" />
                        <div>
                          <Label htmlFor={`cv-${option.value}`} className="cursor-pointer font-medium">
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">{option.desc}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-xl text-foreground mb-2">
                      Do you have any of these conditions?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Select all that apply - this helps personalize your experience
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: "pcos", label: "PCOS / PCOD" },
                      { value: "hormonal_imbalance", label: "Hormonal imbalance (thyroid, etc.)" },
                      { value: "pregnant_ttc", label: "Currently pregnant or trying to conceive" },
                      { value: "contraceptives", label: "On hormonal birth control / IUD" },
                      { value: "menopause", label: "Menopause / perimenopause" },
                      { value: "none", label: "None of these / Prefer not to say" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          data.healthConditions.includes(option.value)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => toggleArrayItem("healthConditions", option.value)}
                      >
                        <Checkbox
                          checked={data.healthConditions.includes(option.value)}
                          id={`hc-${option.value}`}
                        />
                        <Label htmlFor={`hc-${option.value}`} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-xl text-foreground mb-2">
                      Do you track fertility signs?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Optional - helps us provide more relevant insights
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { value: "bbt", label: "Basal body temperature (BBT)" },
                      { value: "cervical_mucus", label: "Cervical mucus tracking" },
                      { value: "ovulation_kit", label: "Ovulation kit / LH test" },
                      { value: "none", label: "None of these" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          data.fertilityTracking.includes(option.value)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => toggleArrayItem("fertilityTracking", option.value)}
                      >
                        <Checkbox
                          checked={data.fertilityTracking.includes(option.value)}
                          id={`ft-${option.value}`}
                        />
                        <Label htmlFor={`ft-${option.value}`} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-xl text-foreground mb-2">
                      Would you like to track symptoms & moods?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Track things like cramps, cravings, energy levels, and emotions
                    </p>
                  </div>
                  <RadioGroup
                    value={data.trackSymptoms}
                    onValueChange={(value) => updateData("trackSymptoms", value)}
                    className="space-y-3"
                  >
                    {[
                      { value: "yes", label: "Yes, I'd love to!", desc: "Get personalized insights based on your patterns" },
                      { value: "no", label: "No, not right now", desc: "You can always enable this later" },
                      { value: "maybe", label: "Maybe later", desc: "We'll remind you occasionally" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          data.trackSymptoms === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => updateData("trackSymptoms", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={`ts-${option.value}`} className="mt-1" />
                        <div>
                          <Label htmlFor={`ts-${option.value}`} className="cursor-pointer font-medium">
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">{option.desc}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {currentStep === 8 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-xl text-foreground mb-2">
                      How should we show predictions?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Choose between exact dates or flexible date ranges
                    </p>
                  </div>
                  <RadioGroup
                    value={data.dynamicPredictions}
                    onValueChange={(value) => updateData("dynamicPredictions", value)}
                    className="space-y-3"
                  >
                    {[
                      { 
                        value: "yes", 
                        label: "Show date ranges with buffer", 
                        desc: "E.g., 'Expected period: Nov 25-31' - more realistic for most cycles" 
                      },
                      { 
                        value: "no", 
                        label: "Show exact predicted dates", 
                        desc: "E.g., 'Expected period: Nov 28' - simpler but less flexible" 
                      },
                      { 
                        value: "not_sure", 
                        label: "Not sure yet", 
                        desc: "We'll use date ranges by default" 
                      },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          data.dynamicPredictions === option.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => updateData("dynamicPredictions", option.value)}
                      >
                        <RadioGroupItem value={option.value} id={`dp-${option.value}`} className="mt-1" />
                        <div>
                          <Label htmlFor={`dp-${option.value}`} className="cursor-pointer font-medium">
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">{option.desc}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {currentStep === 9 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="font-serif text-xl text-foreground mb-2">
                      A few lifestyle details (optional)
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      These can help with more personalized recommendations
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-foreground">Typical stress level</Label>
                      <RadioGroup
                        value={data.stressLevel}
                        onValueChange={(value) => updateData("stressLevel", value)}
                        className="flex gap-3"
                      >
                        {["low", "medium", "high"].map((level) => (
                          <div
                            key={level}
                            className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                              data.stressLevel === level
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => updateData("stressLevel", level)}
                          >
                            <RadioGroupItem value={level} id={`sl-${level}`} />
                            <Label htmlFor={`sl-${level}`} className="cursor-pointer capitalize">
                              {level}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-foreground">Sleep pattern</Label>
                      <RadioGroup
                        value={data.sleepPattern}
                        onValueChange={(value) => updateData("sleepPattern", value)}
                        className="flex gap-3"
                      >
                        {[
                          { value: "regular", label: "Regular" },
                          { value: "irregular", label: "Irregular" },
                        ].map((option) => (
                          <div
                            key={option.value}
                            className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                              data.sleepPattern === option.value
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => updateData("sleepPattern", option.value)}
                          >
                            <RadioGroupItem value={option.value} id={`sp-${option.value}`} />
                            <Label htmlFor={`sp-${option.value}`} className="cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="healthNotes" className="text-foreground">
                        Any health conditions or notes you'd like to share?
                      </Label>
                      <Textarea
                        id="healthNotes"
                        placeholder="E.g., diabetes, thyroid condition, allergies, etc. (optional)"
                        value={data.healthNotes}
                        onChange={(e) => updateData("healthNotes", e.target.value)}
                        className="bg-background border-border resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              {currentStep === TOTAL_STEPS ? (
                saveMutation.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    Complete <Check className="w-4 h-4" />
                  </>
                )
              ) : (
                <>
                  Next <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {currentStep < TOTAL_STEPS && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              You can skip and update these later in your profile
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
