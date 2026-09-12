import { AuditLog, type AuditContext } from "../models/audit-log.model.js";
export const auditService = { record: (context: AuditContext) => AuditLog.create(context) };
