import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {
    'use cache';
    cacheLife('hours');
    
    let events: IEvent[] = [];
    let hasError = false;

    try {
        const response = await fetch(`${BASE_URL}/api/events`);
        
        if (!response.ok) {
            // Changed from console.error to avoid Next.js error screen overlay
            console.warn(`Backend API returned an error status: ${response.status}`);
            hasError = true;
        } else {
            const data = await response.json();
            events = data.events || [];
        }
    } catch (error) {
        console.warn("Failed to reach the API endpoint:", error);
        hasError = true;
    }

    return (
        <section>
            <h1 className="text-center">The Hub for Every Dev <br /> Event You Can't Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>

            <ExploreBtn />

            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>

                <ul className="events">
                    {hasError ? (
                        <p className="text-red-500 bg-red-50 p-4 rounded">
                            ⚠️ Unable to load events right now. Please check your terminal console for the backend API error logs.
                        </p>
                    ) : events && events.length > 0 ? (
                        events.map((event: IEvent) => (
                            <li key={event.title} className="list-none">
                                <EventCard {...event} />
                            </li>
                        ))
                    ) : (
                        <p className="text-muted-foreground">No events found.</p>
                    )}
                </ul>
            </div>
        </section>
    );
};

export default Page;