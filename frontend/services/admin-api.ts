import { apiClient } from "@/lib/api";
export const adminApi = { overview: () => apiClient.get("/admin/overview"), reports: (params?: Record<string, string>) => apiClient.get("/admin/reports", { params }), guests: () => apiClient.get("/admin/guests"), staff: () => apiClient.get("/admin/staff") };
