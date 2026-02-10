import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Recipes from "@/pages/Recipes";
import Meditation from "@/pages/Meditation";
import Education from "@/pages/Education";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Onboarding from "@/pages/Onboarding";

interface OnboardingData {
  isCompleted: boolean;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  const { data: onboardingData, isLoading: onboardingLoading } = useQuery<OnboardingData>({
    queryKey: ["/api/onboarding"],
    enabled: isAuthenticated,
  });

  if (isLoading || (isAuthenticated && onboardingLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-6 h-6 rounded-full bg-primary" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  if (!onboardingData?.isCompleted) {
    return <Onboarding />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/recipes" component={Recipes} />
      <Route path="/meditation" component={Meditation} />
      <Route path="/education" component={Education} />
      <Route path="/chat" component={Chat} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
