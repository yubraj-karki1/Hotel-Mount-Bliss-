import { apiClient } from "@/lib/api";
import type { Envelope, HotelService } from "@/types/domain";

export type ServiceInput = Pick<HotelService, "name" | "description" | "price"> & { isActive?: boolean };

export const serviceApi = {
  list: () => apiClient.get<Envelope<HotelService[]>>("/services"),
  adminList: () => apiClient.get<Envelope<HotelService[]>>("/admin/services"),
  create: (payload: ServiceInput) => apiClient.post<Envelope<HotelService>>("/services", payload),
  update: (id: string, payload: Partial<ServiceInput>) => apiClient.patch<Envelope<HotelService>>(`/services/${id}`, payload),
  requests: () => apiClient.get("/service-requests"),
  request: (payload: unknown) => apiClient.post("/service-requests", payload),
};
