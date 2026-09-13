import { Schema, model } from "mongoose";

const roomSchema = new Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true, index: true },
  description: { type: String, default: "" },
  capacity: { type: Number, required: true, min: 1 },
  bed: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["AVAILABLE", "RESERVED", "OCCUPIED", "CLEANING", "MAINTENANCE", "OUT_OF_SERVICE"], default: "AVAILABLE", index: true },
  amenities: { type: [String], default: [] },
  images: {
    type: [String],
    required: true,
    validate: {
      validator: (images: string[]) => Array.isArray(images) && images.length > 0 && images.every(Boolean),
      message: "Please upload at least one room photo.",
    },
  },
  floor: { type: Number, required: true },
  isActive: { type: Boolean, default: true, index: true },
  bookingLockUntil: { type: Date, select: false },
}, { timestamps: true, versionKey: false });

const bookingSchema = new Schema({
  reference: { type: String, required: true, unique: true, index: true },
  guest: { type: Schema.Types.ObjectId, ref: "User", index: true },
  guestContact: { name: { type: String, required: true }, email: { type: String, required: true, lowercase: true }, phone: { type: String, required: true } },
  room: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
  checkIn: { type: Date, required: true, index: true },
  checkOut: { type: Date, required: true, index: true },
  guests: { type: Number, required: true, min: 1 },
  totalAmount: { type: Number, required: true, min: 0 },
  specialRequests: { type: String, default: "" },
  addOns: { type: [{ service: { type: Schema.Types.ObjectId, ref: "HotelService", required: true }, name: { type: String, required: true }, unitPrice: { type: Number, required: true, min: 0 }, quantity: { type: Number, required: true, min: 1, default: 1 }, total: { type: Number, required: true, min: 0 } }], default: [] },
  status: { type: String, enum: ["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"], default: "PENDING", index: true },
}, { timestamps: true, versionKey: false });

const waitlistSchema = new Schema({
  room: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
  name: { type: String, required: true, trim: true }, email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: "" }, checkIn: { type: Date, required: true, index: true }, checkOut: { type: Date, required: true, index: true },
  guests: { type: Number, required: true, min: 1 }, status: { type: String, enum: ["WAITING", "NOTIFIED", "CANCELLED"], default: "WAITING", index: true },
  notifiedAt: Date,
}, { timestamps: true, versionKey: false });
waitlistSchema.index({ room: 1, email: 1, checkIn: 1, checkOut: 1 }, { unique: true });

const hotelServiceSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true }, description: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 }, isActive: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

const serviceRequestSchema = new Schema({
  guest: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
  service: { type: Schema.Types.ObjectId, ref: "HotelService", required: true },
  quantity: { type: Number, min: 1, default: 1 }, notes: { type: String, default: "" },
  status: { type: String, enum: ["REQUESTED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"], default: "REQUESTED", index: true },
}, { timestamps: true, versionKey: false });

const reviewSchema = new Schema({
  guest: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
  rating: { type: Number, required: true, min: 1, max: 5 }, comment: { type: String, required: true, maxlength: 2000 },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING", index: true },
}, { timestamps: true, versionKey: false });

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, title: { type: String, required: true },
  message: { type: String, required: true }, type: { type: String, default: "INFO" }, readAt: Date,
}, { timestamps: true, versionKey: false });

const inquirySchema = new Schema({
  name: { type: String, required: true }, email: { type: String, required: true, lowercase: true },
  subject: { type: String, required: true }, message: { type: String, required: true },
  status: { type: String, enum: ["NEW", "IN_PROGRESS", "RESOLVED"], default: "NEW" },
}, { timestamps: true, versionKey: false });

const hotelSettingsSchema = new Schema({
  key: { type: String, default: "primary", unique: true }, name: { type: String, required: true },
  timezone: { type: String, required: true }, email: { type: String, default: "" }, phone: { type: String, default: "" },
  address: { type: String, default: "" }, currency: { type: String, default: "NPR" }, taxPercent: { type: Number, default: 0, min: 0, max: 100 },
}, { timestamps: true, versionKey: false });

export const Room = model("Room", roomSchema);
export const Booking = model("Booking", bookingSchema);
export const HotelService = model("HotelService", hotelServiceSchema);
export const ServiceRequest = model("ServiceRequest", serviceRequestSchema);
export const Review = model("Review", reviewSchema);
export const Notification = model("Notification", notificationSchema);
export const Inquiry = model("Inquiry", inquirySchema);
export const HotelSettings = model("HotelSettings", hotelSettingsSchema);
export const WaitlistEntry = model("WaitlistEntry", waitlistSchema);
