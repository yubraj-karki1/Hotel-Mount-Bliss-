import type { RoomStatus } from "@/constants/status";

export const AVAILABILITY_NOTICE = "Room details and availability are subject to confirmation by Hotel Mount Bliss.";

export interface Room { id: string; name: string; type: string; capacity: number; bed: string; price: number; rating: number; status: RoomStatus; amenities: string[]; floor: number }
export const rooms: Room[] = [
  { id: "deluxe-room", name: "Deluxe Room", type: "Deluxe", capacity: 2, bed: "Bed details pending", price: 2500, rating: 0, status: "AVAILABLE", amenities: ["Amenities pending confirmation"], floor: 2 },
  { id: "family-room", name: "Family Room", type: "Family", capacity: 4, bed: "Bed details pending", price: 3500, rating: 0, status: "RESERVED", amenities: ["Amenities pending confirmation"], floor: 3 },
  { id: "standard-room", name: "Standard Room", type: "Standard", capacity: 2, bed: "Bed details pending", price: 1500, rating: 0, status: "CLEANING", amenities: ["Amenities pending confirmation"], floor: 1 },
];

export const hotelServices = ["Room Service", "Laundry", "Breakfast", "Airport Pickup", "Extra Bed"];
