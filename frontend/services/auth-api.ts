import { apiClient } from "@/lib/api";

export type LoginDetails = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegistrationDetails = LoginDetails & {
  name: string;
  phone: string;
};

export type UpdateProfileDetails = Pick<RegistrationDetails, "name" | "phone">;

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  role: string;
  isEmailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  preferences: { bookingUpdates: boolean; serviceUpdates: boolean };
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const authApi = {
  login: (details: LoginDetails) =>
    apiClient.post<ApiResponse<{ user: User }>>("/auth/login", details),

  register: (details: RegistrationDetails) =>
    apiClient.post<ApiResponse<{ user: User }>>("/auth/register", details),

  logout: () => apiClient.post("/auth/logout"),

  getCurrentUser: () =>
    apiClient.get<ApiResponse<User>>("/auth/me"),

  updateProfile: (details: UpdateProfileDetails) =>
    apiClient.patch<ApiResponse<User>>("/auth/me", details),
  forgotPassword: (email: string) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) => apiClient.post("/auth/reset-password", { token, password }),
};
