import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { getToken, clearTokens, login as authLogin, register as authRegister, logout as authLogout } from "@/lib/authUtils";

interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  avgCycleLength: number;
  avgPeriodLength: number;
  profileImageUrl: string | null;
  insights?: {
    cycleDay: number;
    phase: string;
    pmsWindow: { startDay: number; endDay: number };
    nextPeriodDate: string | null;
    ovulationDay: number;
    pregnancy: { isPregnant: boolean };
    menopause: { perimenopauseLikely: boolean; menopause: boolean };
    dailyAdvice: {
      mood: string;
      nutrition: string;
      meditation: string;
      exercise: string;
    };
  };
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const login = useCallback(async (email: string, password: string) => {
    const result = await authLogin(email, password);
    if (result.success) {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
    return result;
  }, [queryClient]);

  const register = useCallback(async (email: string, password: string, firstName?: string, lastName?: string) => {
    const result = await authRegister(email, password, firstName, lastName);
    if (result.success) {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
    return result;
  }, [queryClient]);

  const logout = useCallback(async () => {
    await authLogout();
    queryClient.clear();
    window.location.href = '/';
  }, [queryClient]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    refetch,
  };
}
