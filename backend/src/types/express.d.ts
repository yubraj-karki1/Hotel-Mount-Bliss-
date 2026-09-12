import type { Role } from "../constants/roles.js";
declare global {
  namespace Express {
    interface Request { auth?: { userId: string; role: Role } }
  }
}
export {};
