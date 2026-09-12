import type { Request } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";

export const objectId = z.string().refine(isValidObjectId, "Invalid identifier");
export const idSchema = z.object({ params: z.object({ id: objectId }) });

export const pageInfo = (req: Request) => ({
  page: Math.max(1, Number(req.query.page) || 1),
  pageSize: Math.min(100, Math.max(1, Number(req.query.pageSize) || 20)),
});

export async function paged(model: any, filter: object, req: Request, populate?: string) {
  const { page, pageSize } = pageInfo(req);
  let query = model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);
  if (populate) query = query.populate(populate);
  const [items, total] = await Promise.all([query.lean(), model.countDocuments(filter)]);
  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}
