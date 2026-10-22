import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { type IEvent } from "@/database";
import { connection } from "next/server";

// This page needs live event data and intentionally renders on demand.
export const instant = false;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const Page = async () => {
  // Load live database-backed data at request time, not during static generation.
  await connection();

  let events: IEvent[] = [];
  let hasError = false;

  try {
    const response = await fetch(new URL("/api/events", BASE_URL));
    if (!response.ok) {
      hasError = true;
    } else {
      const data = await response.json();
      events = Array.isArray(data.events) ? data.events : [];
    }
  } catch {
    hasError = true;
  }

  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev Event You Can&apos;t Miss</h1>
      <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>

      <ExploreBtn />

      <div id="events" className="mt-20 space-y-7">
        <h2>Featured Events</h2>
        <ul className="events">
          {hasError ? (
            <li className="list-none text-red-500 bg-red-50 p-4 rounded" role="status">
              Events are temporarily unavailable. Please try again later.
            </li>
          ) : events.length > 0 ? (
            events.map((event) => <li key={event.slug} className="list-none"><EventCard {...event} /></li>)
          ) : (
            <li className="list-none text-muted-foreground">No events found yet.</li>
          )}
        </ul>
      </div>
    </section>
  );
};

export default Page;
