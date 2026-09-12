export const roomStatusStyles = {
  AVAILABLE: "success",
  RESERVED: "accent",
  OCCUPIED: "default",
  CLEANING: "warning",
  MAINTENANCE: "destructive",
  OUT_OF_SERVICE: "destructive",
} as const;

export type RoomStatus = keyof typeof roomStatusStyles;
