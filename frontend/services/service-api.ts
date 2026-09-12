import { apiClient } from "@/lib/api";
import type { Envelope, HotelService } from "@/types/domain";
export const serviceApi = { list: () => apiClient.get<Envelope<HotelService[]>>("/services"), requests: () => apiClient.get("/service-requests"), request: (payload: unknown) => apiClient.post("/service-requests", payload) };
