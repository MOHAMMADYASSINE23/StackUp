import dotenv from "dotenv";
dotenv.config();

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import events from "@/lib/constants";

async function seed() {
  try {
    console.log("MONGODB_URI =", process.env.MONGODB_URI);

    await connectDB();

    console.log("✅ Connected to MongoDB");

    await Event.deleteMany({});

    console.log("🗑 Old events removed");

    const seededEvents = events.map((event) => ({
      ...event,

      description: `${event.title} is one of the biggest technology conferences of the year. Join experts, developers, and industry leaders for talks, networking, and hands-on workshops.`,

      overview: `Join us at ${event.title} to discover the latest trends and technologies.`,

      venue: event.location,

      mode: event.location.includes("Hybrid") ? "hybrid" : "offline",

      audience: "Developers, Students, and Tech Professionals",

      organizer: "StackUp",

      agenda: [
        "Registration",
        "Opening Keynote",
        "Technical Sessions",
        "Lunch Break",
        "Networking",
        "Closing Ceremony",
      ],

      tags: [
        "Technology",
        "Conference",
        "Networking",
      ],
    }));

    await Event.insertMany(seededEvents);

    console.log(`🎉 ${seededEvents.length} events inserted successfully!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:");
    console.error(error);
    process.exit(1);
  }
}

seed();