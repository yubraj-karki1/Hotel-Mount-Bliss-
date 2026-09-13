import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import multer from "multer";
import { Router, type Request } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { authorize, authenticate, optionalAuthenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { Booking, HotelService, HotelSettings, Inquiry, Notification, Review, Room, ServiceRequest, WaitlistEntry } from "../models/domain.model.js";
import { emailService } from "../services/email.service.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { success } from "../utils/response.js";
import { idSchema, objectId, paged } from "./shared/route-utils.js";

const router = Router();
const staff = authorize("RECEPTIONIST", "MANAGER", "ADMIN");
const managers = authorize("MANAGER", "ADMIN");
const roomPhotoDirectory = path.resolve(process.cwd(), "uploads", "room-photos");
fs.mkdirSync(roomPhotoDirectory, { recursive: true });
const acceptedPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const photoExtension: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const roomPhotoUpload = multer({
  storage: multer.diskStorage({
    destination: roomPhotoDirectory,
    filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${photoExtension[file.mimetype] ?? ""}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, callback) => {
    if (!acceptedPhotoTypes.has(file.mimetype)) return callback(new AppError(422, "Room photos must be JPEG, PNG, or WebP images."));
    return callback(null, true);
  },
});
const hasValidImageSignature = (file: Express.Multer.File) => {
  const buffer = Buffer.alloc(12); const descriptor = fs.openSync(file.path, "r");
  try { fs.readSync(descriptor, buffer, 0, buffer.length, 0); } finally { fs.closeSync(descriptor); }
  if (file.mimetype === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (file.mimetype === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
  return file.mimetype === "image/webp" && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
};
const guestBookingSensitive = rateLimit({ windowMs: 15 * 60_000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false });
const ownsOrStaff = (req: Request, owner: unknown) => String(owner) === req.auth!.userId || req.auth!.role !== "CUSTOMER";
const notify = (user: unknown, title: string, message: string, type = "INFO") => Notification.create({ user, title, message, type });
const notifyCustomer = async (user: unknown, preference: "bookingUpdates" | "serviceUpdates", title: string, message: string, type = "INFO") => {
  if (!user) return;
  const recipient = await User.findById(user).select(`preferences.${preference}`).lean();
  if (recipient?.preferences?.[preference] !== false) await notify(user, title, message, type);
};
const notifyStaff = async (title: string, message: string, type = "INFO", roles = ["RECEPTIONIST", "MANAGER", "ADMIN"]) => {
  const recipients = await User.find({ role: { $in: roles }, isActive: true }).select("_id").lean();
  if (recipients.length) await Notification.insertMany(recipients.map(({ _id }) => ({ user: _id, title, message, type })));
};
const alertWaitlist = async (roomId: unknown, availableFrom?: Date, availableTo?: Date) => {
  const room = await Room.findById(roomId).select("name").lean(); if (!room) return;
  const filter: Record<string, unknown> = { room: roomId, status: "WAITING" };
  if (availableFrom && availableTo) Object.assign(filter, { checkIn: { $lt: availableTo }, checkOut: { $gt: availableFrom } });
  const entries = await WaitlistEntry.find(filter).limit(100);
  await Promise.all(entries.map(async entry => {
    const conflict = await Booking.exists({ room: roomId, status: { $nin: ["CANCELLED", "CHECKED_OUT"] }, checkIn: { $lt: entry.checkOut }, checkOut: { $gt: entry.checkIn } });
    if (conflict) return;
    const sent = await emailService.sendAvailabilityAlert(entry.email, room.name, entry.checkIn, entry.checkOut).catch(() => false);
    if (sent) { entry.status = "NOTIFIED"; entry.notifiedAt = new Date(); await entry.save(); }
  }));
};
const releaseCancelledRoom = async (booking: { room: unknown; checkIn: Date; checkOut: Date }) => {
  await Room.updateOne({ _id: booking.room, status: "RESERVED" }, { status: "AVAILABLE" });
  await alertWaitlist(booking.room, booking.checkIn, booking.checkOut);
};

const storedRoomPhoto = z.string().regex(/^\/uploads\/room-photos\/[0-9a-f-]+\.(?:jpg|png|webp)$/i, "Upload room photos before creating the room");
export const roomInput = z.object({ name: z.string().trim().min(2).max(100), type: z.string().trim().min(2).max(60), description: z.string().max(3000).default(""), capacity: z.coerce.number().int().min(1).max(20), bed: z.string().trim().min(2).max(100), price: z.coerce.number().min(0), status: z.enum(["AVAILABLE", "RESERVED", "OCCUPIED", "CLEANING", "MAINTENANCE", "OUT_OF_SERVICE"]).default("AVAILABLE"), amenities: z.array(z.string().trim().min(1)).default([]), images: z.array(storedRoomPhoto).min(1, "Please upload at least one room photo.").max(8), floor: z.coerce.number().int(), isActive: z.boolean().default(true) });
router.get("/rooms", asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { isActive: true };
  if (req.query.type && req.query.type !== "any") filter.type = { $regex: `^${String(req.query.type).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.bookable === "true") filter.status = "AVAILABLE";
  if (req.query.guests) filter.capacity = { $gte: Math.max(1, Number(req.query.guests) || 1) };
  if (req.query.checkIn && req.query.checkOut) {
    const checkIn = new Date(String(req.query.checkIn)); const checkOut = new Date(String(req.query.checkOut));
    if (!Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime()) || checkOut <= checkIn) throw new AppError(422, "Enter a valid check-in and check-out range");
    const conflicts = await Booking.distinct("room", { status: { $nin: ["CANCELLED", "CHECKED_OUT"] }, checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } });
    filter._id = { $nin: conflicts }; filter.status = "AVAILABLE";
  }
  return success(res, 200, "Rooms fetched", await paged(Room, filter, req));
}));
router.get("/rooms/:id", validate(idSchema), asyncHandler(async (req, res) => { const room = await Room.findById(req.params.id).lean(); if (!room) throw new AppError(404, "Room not found"); return success(res, 200, "Room fetched", room); }));
const stayQuery = z.object({ params: z.object({ id: objectId }), query: z.object({ checkIn: z.coerce.date(), checkOut: z.coerce.date(), guests: z.coerce.number().int().min(1).max(20) }).refine(v => v.checkOut > v.checkIn, { message: "Check-out must be after check-in" }) });
router.get("/rooms/:id/alternatives", validate(stayQuery), asyncHandler(async (req, res) => {
  const requested = await Room.findById(req.params.id).lean(); if (!requested) throw new AppError(404, "Room not found");
  const conflicts = await Booking.distinct("room", { status: { $nin: ["CANCELLED", "CHECKED_OUT"] }, checkIn: { $lt: req.query.checkOut }, checkOut: { $gt: req.query.checkIn } });
  const rooms = await Room.find({ _id: { $ne: requested._id, $nin: conflicts }, isActive: true, status: "AVAILABLE", capacity: { $gte: req.query.guests } }).sort({ price: 1 }).limit(4).lean();
  return success(res, 200, "Alternative rooms fetched", rooms);
}));
router.get("/settings/public", asyncHandler(async (_req, res) => success(res, 200, "Hotel settings fetched", await HotelSettings.findOne({ key: "primary" }).lean())));
router.post("/rooms/photos", authenticate, managers, roomPhotoUpload.array("photos", 8), asyncHandler(async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (!files.length) throw new AppError(422, "Please upload at least one room photo.");
  const invalid = files.filter(file => !hasValidImageSignature(file));
  if (invalid.length) { await Promise.all(files.map(file => fs.promises.unlink(file.path).catch(() => undefined))); throw new AppError(422, "One or more files are not valid room images."); }
  return success(res, 201, "Room photos uploaded", files.map(file => `/uploads/room-photos/${file.filename}`));
}));
router.post("/rooms", authenticate, managers, validate(z.object({ body: roomInput })), asyncHandler(async (req, res) => {
  const missing = req.body.images.some((image: string) => !fs.existsSync(path.join(process.cwd(), image.replace(/^\//, ""))));
  if (missing) throw new AppError(422, "One or more uploaded room photos are unavailable.");
  return success(res, 201, "Room created", await Room.create(req.body));
}));
router.patch("/rooms/:id", authenticate, staff, validate(z.object({ params: z.object({ id: objectId }), body: roomInput.partial() })), asyncHandler(async (req, res) => { const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!room) throw new AppError(404, "Room not found"); if (req.body.status === "AVAILABLE") await alertWaitlist(room._id); return success(res, 200, "Room updated", room); }));
router.delete("/rooms/:id", authenticate, managers, validate(idSchema), asyncHandler(async (req, res) => { const room = await Room.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }); if (!room) throw new AppError(404, "Room not found"); return success(res, 200, "Room archived", room); }));

const bookingInput = z.object({ roomId: objectId, checkIn: z.coerce.date(), checkOut: z.coerce.date(), guests: z.coerce.number().int().min(1).max(20), specialRequests: z.string().max(1000).default(""), guestName: z.string().trim().min(2).max(100), guestEmail: z.email().transform(v=>v.toLowerCase()), guestPhone: z.string().trim().min(7).max(25), addOnIds: z.array(objectId).max(10).default([]) }).refine(v => v.checkOut > v.checkIn, { message: "Check-out must be after check-in", path: ["checkOut"] });
const waitlistInput = z.object({ roomId: objectId, checkIn: z.coerce.date(), checkOut: z.coerce.date(), guests: z.coerce.number().int().min(1).max(20), name: z.string().trim().min(2).max(100), email: z.email().transform(v => v.toLowerCase()), phone: z.string().trim().max(25).default("") }).refine(v => v.checkOut > v.checkIn, { message: "Check-out must be after check-in", path: ["checkOut"] });
router.post("/waitlist", guestBookingSensitive, validate(z.object({ body: waitlistInput })), asyncHandler(async (req, res) => {
  const room = await Room.findOne({ _id: req.body.roomId, isActive: true }); if (!room) throw new AppError(404, "Room not found"); if (req.body.guests > room.capacity) throw new AppError(422, "Guest count exceeds room capacity");
  const conflict = await Booking.exists({ room: room._id, status: { $nin: ["CANCELLED", "CHECKED_OUT"] }, checkIn: { $lt: req.body.checkOut }, checkOut: { $gt: req.body.checkIn } });
  if (room.status === "AVAILABLE" && !conflict) throw new AppError(409, "This room is available for those dates; you can book it directly");
  const duplicate = await WaitlistEntry.exists({ room: room._id, email: req.body.email, checkIn: req.body.checkIn, checkOut: req.body.checkOut }); if (duplicate) throw new AppError(409, "You are already on this waitlist");
  const entry = await WaitlistEntry.create({ room: room._id, ...req.body, roomId: undefined });
  return success(res, 201, "You have joined the waitlist", { id: entry._id, status: entry.status });
}));
async function quoteBooking(input: z.infer<typeof bookingInput>) {
  // Normalize at the service boundary as well as in validation. Requests arrive as
  // JSON strings, and this keeps date arithmetic safe if the function is reused.
  const checkIn = new Date(input.checkIn);
  const checkOut = new Date(input.checkOut);
  if (!Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime()) || checkOut <= checkIn) {
    throw new AppError(422, "Enter a valid check-in and check-out range");
  }
  const room = await Room.findOne({ _id: input.roomId, isActive: true, status: "AVAILABLE" });
  if (!room) throw new AppError(409, "Room is operationally unavailable");
  if (input.guests > Number(room.capacity)) throw new AppError(422, "Guest count exceeds room capacity");
  const conflict = await Booking.exists({ room: room._id, status: { $nin: ["CANCELLED", "CHECKED_OUT"] }, checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } });
  if (conflict) throw new AppError(409, "Room is unavailable for those dates");
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
  const uniqueIds = [...new Set(input.addOnIds)];
  const services = uniqueIds.length ? await HotelService.find({ _id: { $in: uniqueIds }, isActive: true }) : [];
  if (services.length !== uniqueIds.length) throw new AppError(422, "One or more selected add-ons are unavailable");
  const addOns = services.map(service => ({ service: service._id, name: service.name, unitPrice: Number(service.price), quantity: 1, total: Number(service.price) }));
  const roomTotal = nights * Number(room.price);
  const addOnTotal = addOns.reduce((sum, item) => sum + item.total, 0);
  return { room, nights, roomTotal, addOnTotal, addOns, totalAmount: roomTotal + addOnTotal };
}
router.post("/bookings/quote", validate(z.object({ body: bookingInput })), asyncHandler(async (req, res) => { const value = await quoteBooking(req.body); return success(res, 200, "Booking quote calculated", { room: value.room, nights: value.nights, roomTotal: value.roomTotal, addOnTotal: value.addOnTotal, totalAmount: value.totalAmount }); }));
router.post("/bookings", optionalAuthenticate, validate(z.object({ body: bookingInput })), asyncHandler(async (req, res) => {
  const now = new Date(); const lockUntil = new Date(now.getTime() + 15_000);
  const locked = await Room.findOneAndUpdate({ _id: req.body.roomId, isActive: true, status: "AVAILABLE", $or: [{ bookingLockUntil: { $exists: false } }, { bookingLockUntil: { $lt: now } }] }, { bookingLockUntil: lockUntil }, { new: true });
  if (!locked) throw new AppError(409, "Another guest is booking this room; please try again");
  try {
    const value = await quoteBooking(req.body);
    const booking = await Booking.create({ reference: `HMB-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`, guest: req.auth?.userId, guestContact:{name:req.body.guestName,email:req.body.guestEmail,phone:req.body.guestPhone}, room:req.body.roomId, checkIn:req.body.checkIn, checkOut:req.body.checkOut, guests:req.body.guests, specialRequests:req.body.specialRequests, addOns:value.addOns, totalAmount:value.totalAmount });
    if(req.auth) await notifyCustomer(req.auth.userId, "bookingUpdates", "Booking received", `Booking ${booking.reference} is pending confirmation.`, "BOOKING"); await notifyStaff("New booking", `${booking.reference} was submitted by ${req.body.guestName}.`, "BOOKING"); return success(res, 201, "Booking created", booking);
  } finally { await Room.updateOne({ _id: req.body.roomId, bookingLockUntil: lockUntil }, { $unset: { bookingLockUntil: 1 } }); }
}));
router.get("/bookings", authenticate, asyncHandler(async (req, res) => { const filter: Record<string, unknown> = req.auth!.role === "CUSTOMER" ? { guest: req.auth!.userId } : {}; if (req.query.status) filter.status = req.query.status; if (req.query.from || req.query.to) { filter.checkIn = { ...(req.query.from ? { $gte: new Date(String(req.query.from)) } : {}), ...(req.query.to ? { $lte: new Date(String(req.query.to)) } : {}) }; } if (req.query.search) { const search = String(req.query.search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); filter.$or = [{ reference: { $regex: search, $options: "i" } }, { "guestContact.name": { $regex: search, $options: "i" } }, { "guestContact.email": { $regex: search, $options: "i" } }]; } return success(res, 200, "Bookings fetched", await paged(Booking, filter, req, "room guest")); }));
const guestBookingAccess = z.object({ body: z.object({ reference: z.string().trim().min(6).max(50).transform(v=>v.toUpperCase()), email: z.email().transform(v=>v.toLowerCase()) }) });
router.post("/bookings/lookup", guestBookingSensitive, validate(guestBookingAccess), asyncHandler(async(req,res)=>{const booking=await Booking.findOne({reference:req.body.reference,"guestContact.email":req.body.email}).populate("room").lean();if(!booking)throw new AppError(404,"Booking not found; check the reference and email");return success(res,200,"Booking fetched",booking)}));
router.patch("/bookings/guest-cancel", guestBookingSensitive, validate(guestBookingAccess), asyncHandler(async(req,res)=>{const booking=await Booking.findOne({reference:req.body.reference,"guestContact.email":req.body.email});if(!booking)throw new AppError(404,"Booking not found; check the reference and email");if(["CHECKED_IN","CHECKED_OUT","CANCELLED"].includes(booking.status))throw new AppError(409,"Booking cannot be cancelled");booking.status="CANCELLED";await booking.save();await releaseCancelledRoom(booking);await notifyStaff("Booking cancelled", `${booking.reference} was cancelled by the guest.`, "BOOKING");return success(res,200,"Booking cancelled",booking)}));
router.get("/bookings/:id", authenticate, validate(idSchema), asyncHandler(async (req, res) => { const booking = await Booking.findById(req.params.id).populate("room guest"); if (!booking) throw new AppError(404, "Booking not found"); if (!ownsOrStaff(req, booking.guest && (booking.guest as any)._id ? (booking.guest as any)._id : booking.guest)) throw new AppError(403, "Access denied"); return success(res, 200, "Booking fetched", booking); }));
router.patch("/bookings/:id/status", authenticate, staff, validate(z.object({ params: z.object({ id: objectId }), body: z.object({ status: z.enum(["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"]) }) })), asyncHandler(async (req, res) => { const booking = await Booking.findById(req.params.id); if (!booking) throw new AppError(404, "Booking not found"); const transitions: Record<string, string[]> = { PENDING: ["CONFIRMED", "CHECKED_IN", "CANCELLED"], CONFIRMED: ["CHECKED_IN", "CANCELLED"], CHECKED_IN: ["CHECKED_OUT"], CHECKED_OUT: [], CANCELLED: [] }; if (!transitions[booking.status]?.includes(req.body.status)) throw new AppError(409, `Cannot change a ${booking.status} booking to ${req.body.status}`); booking.status = req.body.status; await booking.save(); const roomStatus = req.body.status === "CHECKED_IN" ? "OCCUPIED" : req.body.status === "CHECKED_OUT" ? "CLEANING" : null; if (roomStatus) await Room.findByIdAndUpdate(booking.room, { status: roomStatus }); if (req.body.status === "CANCELLED") await releaseCancelledRoom(booking); await notifyCustomer(booking.guest, "bookingUpdates", "Booking updated", `${booking.reference} is now ${booking.status}.`, "BOOKING"); return success(res, 200, "Booking status updated", booking); }));
router.patch("/bookings/:id/cancel", authenticate, validate(idSchema), asyncHandler(async (req, res) => { const booking = await Booking.findById(req.params.id); if (!booking) throw new AppError(404, "Booking not found"); if (!ownsOrStaff(req, booking.guest)) throw new AppError(403, "Access denied"); if (["CHECKED_IN", "CHECKED_OUT", "CANCELLED"].includes(booking.status)) throw new AppError(409, "Booking cannot be cancelled"); booking.status = "CANCELLED"; await booking.save(); await releaseCancelledRoom(booking); return success(res, 200, "Booking cancelled", booking); }));

router.get("/services", asyncHandler(async (_req, res) => success(res, 200, "Services fetched", await HotelService.find({ isActive: true }).sort({ name: 1 }).lean())));
router.get("/admin/services", authenticate, managers, asyncHandler(async (_req,res)=>success(res,200,"Services fetched",await HotelService.find().sort({name:1}).lean())));
router.post("/services", authenticate, managers, validate(z.object({ body: z.object({ name: z.string().trim().min(2), description: z.string().max(2000).default(""), price: z.coerce.number().min(0), isActive: z.boolean().default(true) }) })), asyncHandler(async (req, res) => success(res, 201, "Service created", await HotelService.create(req.body))));
router.patch("/services/:id", authenticate, managers, validate(z.object({ params: z.object({ id: objectId }), body: z.object({ name: z.string().trim().min(2), description: z.string().max(2000), price: z.coerce.number().min(0), isActive: z.boolean() }).partial() })), asyncHandler(async (req, res) => { const item = await HotelService.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!item) throw new AppError(404, "Service not found"); return success(res, 200, "Service updated", item); }));
router.get("/service-requests", authenticate, asyncHandler(async (req, res) => success(res, 200, "Service requests fetched", await paged(ServiceRequest, req.auth!.role === "CUSTOMER" ? { guest: req.auth!.userId } : {}, req, "booking service guest"))));
router.post("/service-requests", authenticate, validate(z.object({ body: z.object({ bookingId: objectId, serviceId: objectId, quantity: z.coerce.number().int().min(1).max(20).default(1), notes: z.string().max(1000).default("") }) })), asyncHandler(async (req, res) => { const booking = await Booking.findById(req.body.bookingId); if (!booking || !ownsOrStaff(req, booking.guest)) throw new AppError(404, "Eligible booking not found"); const item = await ServiceRequest.create({ guest: booking.guest, booking: booking._id, service: req.body.serviceId, quantity: req.body.quantity, notes: req.body.notes }); await notifyStaff("New service request", `A service was requested for booking ${booking.reference}.`, "SERVICE", ["RECEPTIONIST", "HOUSEKEEPER", "MANAGER", "ADMIN"]); return success(res, 201, "Service requested", item); }));
router.patch("/service-requests/:id", authenticate, authorize("HOUSEKEEPER", "RECEPTIONIST", "MANAGER", "ADMIN"), validate(z.object({ params: z.object({ id: objectId }), body: z.object({ status: z.enum(["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]) }) })), asyncHandler(async (req, res) => { const item = await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!item) throw new AppError(404, "Request not found"); await notifyCustomer(item.guest, "serviceUpdates", "Service request updated", `Your service request is now ${item.status}.`, "SERVICE"); return success(res, 200, "Service request updated", item); }));

router.get("/reviews", asyncHandler(async (req, res) => success(res, 200, "Reviews fetched", await paged(Review, { status: "APPROVED" }, req, "guest"))));
router.post("/reviews", authenticate, validate(z.object({ body: z.object({ bookingId: objectId, rating: z.coerce.number().int().min(1).max(5), comment: z.string().trim().min(10).max(2000) }) })), asyncHandler(async (req, res) => { const booking = await Booking.findOne({ _id: req.body.bookingId, guest: req.auth!.userId, status: "CHECKED_OUT" }); if (!booking) throw new AppError(422, "Only completed stays can be reviewed"); const review = await Review.create({ guest: req.auth!.userId, booking: booking._id, rating: req.body.rating, comment: req.body.comment }); await notifyStaff("Review awaiting moderation", `A review for ${booking.reference} is ready for approval.`, "REVIEW", ["MANAGER", "ADMIN"]); return success(res, 201, "Review submitted for approval", review); }));
router.patch("/reviews/:id", authenticate, managers, validate(z.object({ params: z.object({ id: objectId }), body: z.object({ status: z.enum(["APPROVED", "REJECTED"]) }) })), asyncHandler(async (req, res) => { const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!review) throw new AppError(404, "Review not found"); await notify(review.guest, "Review moderated", `Your review was ${review.status.toLowerCase()}.`, "REVIEW"); return success(res, 200, "Review moderated", review); }));

router.get("/notifications", authenticate, asyncHandler(async (req, res) => success(res, 200, "Notifications fetched", await paged(Notification, { user: req.auth!.userId }, req))));
router.patch("/notifications/read-all", authenticate, asyncHandler(async (req, res) => { await Notification.updateMany({ user: req.auth!.userId, readAt: null }, { readAt: new Date() }); return success(res, 200, "All notifications marked read", null); }));
router.patch("/notifications/:id/read", authenticate, validate(idSchema), asyncHandler(async (req, res) => { const item = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.auth!.userId }, { readAt: new Date() }, { new: true }); if (!item) throw new AppError(404, "Notification not found"); return success(res, 200, "Notification marked read", item); }));

router.get("/favorites", authenticate, asyncHandler(async (req, res) => { const user = await User.findById(req.auth!.userId).populate("favorites"); return success(res, 200, "Favorites fetched", user?.favorites ?? []); }));
router.post("/favorites/:id", authenticate, validate(idSchema), asyncHandler(async (req, res) => { if (!await Room.exists({ _id: req.params.id, isActive: true })) throw new AppError(404, "Room not found"); await User.updateOne({ _id: req.auth!.userId }, { $addToSet: { favorites: req.params.id } }); return success(res, 200, "Room added to favorites", null); }));
router.delete("/favorites/:id", authenticate, validate(idSchema), asyncHandler(async (req, res) => { await User.updateOne({ _id: req.auth!.userId }, { $pull: { favorites: req.params.id } }); return success(res, 200, "Room removed from favorites", null); }));
router.patch("/preferences", authenticate, validate(z.object({ body: z.object({ bookingUpdates: z.boolean(), serviceUpdates: z.boolean() }) })), asyncHandler(async (req, res) => { const user = await User.findByIdAndUpdate(req.auth!.userId, { preferences: req.body }, { new: true }); return success(res, 200, "Preferences updated", user?.preferences); }));

router.post("/contact", validate(z.object({ body: z.object({ name: z.string().trim().min(2).max(100), email: z.email().transform(v => v.toLowerCase()), subject: z.string().trim().min(3).max(200), message: z.string().trim().min(10).max(5000) }) })), asyncHandler(async (req, res) => { const inquiry = await Inquiry.create(req.body); await notifyStaff("New enquiry", `${inquiry.name}: ${inquiry.subject}`, "INQUIRY"); return success(res, 201, "Enquiry received", inquiry); }));
router.get("/admin/overview", authenticate, staff, asyncHandler(async (_req, res) => { const [rooms, bookings, guests, arrivalsToday, openRequests] = await Promise.all([Room.countDocuments({ isActive: true }), Booking.countDocuments(), User.countDocuments({ role: "CUSTOMER" }), Booking.countDocuments({ checkIn: { $gte: new Date(new Date().setHours(0, 0, 0, 0)), $lt: new Date(new Date().setHours(24, 0, 0, 0)) }, status: { $nin: ["CANCELLED"] } }), ServiceRequest.countDocuments({ status: { $nin: ["COMPLETED", "CANCELLED"] } })]); return success(res, 200, "Overview fetched", { rooms, bookings, guests, arrivalsToday, openRequests }); }));
router.get("/admin/reports", authenticate, managers, asyncHandler(async (_req, res) => { const [summary] = await Booking.aggregate([{ $match: { status: { $ne: "CANCELLED" } } }, { $group: { _id: null, bookingValue: { $sum: "$totalAmount" }, bookings: { $sum: 1 }, guests: { $sum: "$guests" } } }]); const bookingStatuses = await Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]); return success(res, 200, "Reports fetched", { summary: summary ?? { bookingValue: 0, bookings: 0, guests: 0 }, bookingStatuses }); }));
router.get("/admin/reviews", authenticate, managers, asyncHandler(async(req,res)=>success(res,200,"Reviews fetched",await paged(Review,{},req,"guest booking"))));
router.get("/admin/guests", authenticate, staff, asyncHandler(async (req, res) => success(res, 200, "Guests fetched", await paged(User, { role: "CUSTOMER" }, req))));
router.get("/admin/staff", authenticate, managers, asyncHandler(async (req, res) => success(res, 200, "Staff fetched", await paged(User, { role: { $ne: "CUSTOMER" } }, req))));
router.post("/admin/staff", authenticate, managers, validate(z.object({ body: z.object({ name: z.string().trim().min(2), email: z.email().transform(v=>v.toLowerCase()), phone: z.string().trim().min(7), password: z.string().min(8).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/), role: z.enum(["RECEPTIONIST", "HOUSEKEEPER", "MANAGER", "ADMIN"]) }) })), asyncHandler(async (req, res) => { if (req.auth!.role !== "ADMIN" && req.body.role === "ADMIN") throw new AppError(403, "Only an administrator can create another administrator"); if(await User.exists({email:req.body.email})) throw new AppError(409,"Email already exists"); const user=await User.create({...req.body,password:await bcrypt.hash(req.body.password,12),isEmailVerified:true}); return success(res,201,"Staff account created",user.toJSON()); }));
router.patch("/admin/staff/:id", authenticate, managers, validate(z.object({ params:z.object({id:objectId}), body:z.object({name:z.string().trim().min(2),phone:z.string().trim().min(7),role:z.enum(["RECEPTIONIST","HOUSEKEEPER","MANAGER","ADMIN"]),isActive:z.boolean()}).partial() })), asyncHandler(async(req,res)=>{const target=await User.findOne({_id:req.params.id,role:{$ne:"CUSTOMER"}}).select("role");if(!target)throw new AppError(404,"Staff member not found");if(req.auth!.role!=="ADMIN"&&(target.role==="ADMIN"||req.body.role==="ADMIN"))throw new AppError(403,"Only an administrator can manage administrator accounts");const user=await User.findByIdAndUpdate(target._id,req.body,{new:true,runValidators:true});return success(res,200,"Staff updated",user)}));
router.get("/admin/inquiries", authenticate, staff, asyncHandler(async(req,res)=>success(res,200,"Inquiries fetched",await paged(Inquiry,{},req))));
router.patch("/admin/inquiries/:id", authenticate, staff, validate(z.object({params:z.object({id:objectId}),body:z.object({status:z.enum(["NEW","IN_PROGRESS","RESOLVED"])})})), asyncHandler(async(req,res)=>{const item=await Inquiry.findByIdAndUpdate(req.params.id,req.body,{new:true});if(!item)throw new AppError(404,"Inquiry not found");return success(res,200,"Inquiry updated",item)}));
router.get("/admin/settings", authenticate, managers, asyncHandler(async(_req,res)=>success(res,200,"Settings fetched",await HotelSettings.findOneAndUpdate({key:"primary"},{$setOnInsert:{name:"Hotel Mount Bliss",timezone:"Asia/Katmandu"}},{upsert:true,new:true}))));
router.patch("/admin/settings", authenticate, managers, validate(z.object({body:z.object({name:z.string().trim().min(2),timezone:z.string().min(3),email:z.union([z.literal(""),z.email()]),phone:z.string().max(30),address:z.string().max(500),currency:z.string().length(3),taxPercent:z.coerce.number().min(0).max(100)})})), asyncHandler(async(req,res)=>success(res,200,"Settings updated",await HotelSettings.findOneAndUpdate({key:"primary"},req.body,{upsert:true,new:true,runValidators:true}))));
router.get("/housekeeping", authenticate, authorize("HOUSEKEEPER", "RECEPTIONIST", "MANAGER", "ADMIN"), asyncHandler(async (req, res) => success(res, 200, "Housekeeping rooms fetched", await paged(Room, { status: { $in: ["CLEANING", "MAINTENANCE"] }, isActive: true }, req))));

export default router;
