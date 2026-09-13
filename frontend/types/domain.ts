export type RoomStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "CLEANING" | "MAINTENANCE" | "OUT_OF_SERVICE";
export interface Room { _id?: string; id?: string; name: string; type: string; description?: string; capacity: number; bed: string; price: number; status: RoomStatus; amenities: string[]; images: string[]; floor: number; isActive?: boolean }
export interface BookingAddOn { service: string; name: string; unitPrice: number; quantity: number; total: number }
export interface Booking { _id: string; reference: string; guest?: { _id: string; name: string; email: string } | string; guestContact: { name: string; email: string; phone: string }; room: Room | string; checkIn: string; checkOut: string; guests: number; totalAmount: number; specialRequests: string; addOns?: BookingAddOn[]; status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" }
export interface Notification { _id: string; title: string; message: string; type: string; readAt?: string; createdAt: string }
export interface HotelService { _id: string; name: string; description: string; price: number; isActive: boolean }
export interface Paged<T> { items: T[]; page: number; pageSize: number; total: number; totalPages: number }
export interface Envelope<T> { success: boolean; message: string; data: T }
