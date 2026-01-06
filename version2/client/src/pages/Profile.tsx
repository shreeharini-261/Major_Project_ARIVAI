import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";
import { User as UserIcon, Calendar, Save, LogOut } from "lucide-react";

export default function Profile() {
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    avgCycleLength: 28,
    avgPeriodLength: 5,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        dateOfBirth: user.dateOfBirth || "",
        avgCycleLength: user.avgCycleLength || 28,
        avgPeriodLength: user.avgPeriodLength || 5,
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const getInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20 pb-8 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-64 bg-muted rounded" />
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
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Profile Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and cycle preferences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-card border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {formData.firstName} {formData.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="bg-background border-border"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="bg-background border-border"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="bg-background border-border"
                    data-testid="input-date-of-birth"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Cycle Settings
                </CardTitle>
                <CardDescription>
                  Customize your cycle tracking preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cycleLength">Average Cycle Length (days)</Label>
                    <Input
                      id="cycleLength"
                      type="number"
                      min="21"
                      max="45"
                      value={formData.avgCycleLength}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          avgCycleLength: parseInt(e.target.value) || 28,
                        })
                      }
                      className="bg-background border-border"
                      data-testid="input-cycle-length"
                    />
                    <p className="text-xs text-muted-foreground">
                      Typical range: 21-35 days
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodLength">Average Period Length (days)</Label>
                    <Input
                      id="periodLength"
                      type="number"
                      min="2"
                      max="10"
                      value={formData.avgPeriodLength}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          avgPeriodLength: parseInt(e.target.value) || 5,
                        })
                      }
                      className="bg-background border-border"
                      data-testid="input-period-length"
                    />
                    <p className="text-xs text-muted-foreground">
                      Typical range: 2-7 days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="gap-2"
                data-testid="button-save-profile"
              >
                <Save className="w-4 h-4" />
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>

              <Button 
                variant="outline" 
                className="gap-2 text-destructive hover:text-destructive" 
                data-testid="button-logout"
                onClick={() => logout()}
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
