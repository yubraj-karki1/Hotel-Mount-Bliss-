export const roles = ["CUSTOMER", "RECEPTIONIST", "HOUSEKEEPER", "MANAGER", "ADMIN"] as const;
export type Role = (typeof roles)[number];
