import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function hasValidAdminKey(request: NextRequest): boolean {
  const expected = process.env.EVENT_ADMIN_API_KEY;
  const authorization = request.headers.get("authorization");
  if (!expected || !authorization?.startsWith("Bearer ")) return false;

  const provided = authorization.slice("Bearer ".length);
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  return expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer);
}

function readRequiredText(formData: FormData, key: string, maxLength: number): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) return null;
  return normalized;
}

function readStringArray(formData: FormData, key: string, maxItems: number): string[] | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !Array.isArray(parsed) ||
      parsed.length < 1 ||
      parsed.length > maxItems ||
      !parsed.every((item) => typeof item === "string" && item.trim().length > 0 && item.length <= 200)
    ) {
      return null;
    }
    return parsed.map((item: string) => item.trim());
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Event creation uploads media and writes to the database, so it must never be public.
  if (!process.env.EVENT_ADMIN_API_KEY) {
    return NextResponse.json(
      { message: "Event creation is not configured on this deployment." },
      { status: 503 },
    );
  }

  if (!hasValidAdminKey(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return NextResponse.json(
      { message: "Image upload is not configured on this deployment." },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_IMAGE_SIZE + 256 * 1024) {
    return NextResponse.json({ message: "Request payload is too large." }, { status: 413 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ message: "A valid image file is required." }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ message: "Image must be 5 MB or smaller." }, { status: 413 });
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "Image must be a JPEG, PNG, or WebP file." },
        { status: 415 },
      );
    }

    const title = readRequiredText(formData, "title", 100);
    const description = readRequiredText(formData, "description", 1000);
    const overview = readRequiredText(formData, "overview", 500);
    const venue = readRequiredText(formData, "venue", 200);
    const location = readRequiredText(formData, "location", 200);
    const date = readRequiredText(formData, "date", 40);
    const time = readRequiredText(formData, "time", 40);
    const mode = readRequiredText(formData, "mode", 20);
    const audience = readRequiredText(formData, "audience", 200);
    const organizer = readRequiredText(formData, "organizer", 200);
    const tags = readStringArray(formData, "tags", 20);
    const agenda = readStringArray(formData, "agenda", 50);

    if (
      !title || !description || !overview || !venue || !location || !date ||
      !time || !mode || !audience || !organizer || !tags || !agenda ||
      !["online", "offline", "hybrid"].includes(mode.toLowerCase())
    ) {
      return NextResponse.json(
        { message: "Please provide all required event fields in a valid format." },
        { status: 400 },
      );
    }

    await connectDB();

    const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
    const uploadResult = await imagekit.upload({
      file: Buffer.from(await file.arrayBuffer()),
      fileName: "event-upload",
      folder: "/DevEvent",
      useUniqueFileName: true,
    });

    const createdEvent = await Event.create({
      title,
      description,
      overview,
      venue,
      location,
      date,
      time,
      mode: mode.toLowerCase(),
      audience,
      organizer,
      tags,
      agenda,
      image: uploadResult.url,
    });

    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
      { status: 201 },
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Event creation failed:", error);
    }
    return NextResponse.json({ message: "Event creation failed." }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ message: "Events fetched successfully", events }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Event fetching failed:", error);
    }
    return NextResponse.json({ message: "Event fetching failed." }, { status: 500 });
  }
}
