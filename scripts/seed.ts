import dotenv from "dotenv";
dotenv.config();

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import events from "@/lib/constants";

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB.");

    const seededEvents = events.map((event) => ({
      ...event,
      description: event.title + " is a sample technology event for the StackUp demo. Verify the official event website for current details.",
      overview: "Explore the topics and community around " + event.title + ".",
      venue: event.location,
      mode: event.location.includes("Hybrid") ? "hybrid" : "offline",
      audience: "Developers, Students, and Tech Professionals",
      organizer: "StackUp Demo",
      agenda: [
        "Registration",
        "Opening Keynote",
        "Technical Sessions",
        "Networking",
        "Closing Ceremony",
      ],
      tags: ["Technology", "Conference", "Networking"],
    }));

    for (const event of seededEvents) {
      await Event.updateOne(
        { slug: event.slug },
        { $set: event },
        { upsert: true, runValidators: true },
      );
    }

    console.log("Seeded or updated " + seededEvents.length + " demo events without deleting existing records.");
  } catch (error) {
    console.error("Seeding failed. Check the database connection and seed data.");
    if (process.env.NODE_ENV === "development" && error instanceof Error) {
      console.error(error.message);
    }
    process.exitCode = 1;
  } finally {
    // Exit explicitly because the MongoDB connection can keep the process alive.
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect().catch(() => undefined);
  }
}

void seed();
