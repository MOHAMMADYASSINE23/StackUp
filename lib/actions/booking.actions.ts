"use server";

import { Types } from "mongoose";
import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";
import Event from "@/database/event.model";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

type BookingInput = {
  email: string;
  eventId: string;
  slug: string;
};

export async function createBooking({ email, eventId, slug }: BookingInput) {
  const normalizedEmail = normalizeEmail(email);

  if (
    !normalizedEmail ||
    normalizedEmail.length > 254 ||
    !isValidEmail(normalizedEmail) ||
    !Types.ObjectId.isValid(eventId) ||
    !slug.trim()
  ) {
    return { success: false, message: "Please provide valid booking details." };
  }

  try {
    await connectDB();

    const event = await Event.findOne({ _id: eventId, slug: slug.trim().toLowerCase() })
      .select("_id")
      .lean();

    if (!event) {
      return { success: false, message: "This event could not be found." };
    }

    await Booking.create({ eventId: event._id, email: normalizedEmail });
    return { success: true };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return { success: false, message: "This email has already booked this event." };
    }

    console.error("Booking creation failed.");
    return { success: false, message: "We could not complete your booking. Please try again." };
  }
}
