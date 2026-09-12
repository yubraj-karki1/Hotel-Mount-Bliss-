import { apiClient } from "@/lib/api";
export const reviewApi = { list: () => apiClient.get("/reviews"), create: (payload: unknown) => apiClient.post("/reviews", payload), moderate: (id: string, status: "APPROVED" | "REJECTED") => apiClient.patch(`/reviews/${id}`, { status }) };
