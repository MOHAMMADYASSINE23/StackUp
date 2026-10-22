"use server";

import connectDB from "@/lib/mongodb";
import Event, { type IEvent } from "@/database/event.model";

export async function getSimilarEventsBySlug(slug: string): Promise<IEvent[]> {
  try {
    await connectDB();

    const currentEvent = await Event.findOne({ slug: slug.trim().toLowerCase() })
      .select("tags")
      .lean();

    if (!currentEvent?.tags?.length) return [];

    const similarEvents = await Event.find({
      slug: { $ne: slug.trim().toLowerCase() },
      tags: { $in: currentEvent.tags },
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    return similarEvents as unknown as IEvent[];
  } catch {
    console.error("Failed to load similar events.");
    return [];
  }
}
