import { apiClient } from "@/lib/api";
import type { Envelope, Notification, Paged } from "@/types/domain";
export const notificationApi = { list: () => apiClient.get<Envelope<Paged<Notification>>>("/notifications"), markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`), markAllRead: () => apiClient.patch("/notifications/read-all") };
