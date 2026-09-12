"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi, type User } from "@/services/auth-api";

export function useCurrentUser(enabled = true) {
  return useQuery<User>({
    queryKey: ["auth", "current-user"],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.data.data;
    },
    retry: false,
    enabled,
  });
}
