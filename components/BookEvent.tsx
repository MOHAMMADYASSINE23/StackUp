"use client";

import { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setMessage("");

    try {
      const result = await createBooking({ email, eventId, slug });
      if (result.success) {
        setSubmitted(true);
      } else {
        setMessage(result.message || "We could not complete your booking. Please try again.");
      }
    } catch {
      setMessage("We could not complete your booking. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm" role="status">Thank you for booking your spot.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="booking-email">Email address</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="booking-email"
              placeholder="Enter your email address"
              disabled={pending}
            />
          </div>
          {message && <p className="text-sm text-red-500" role="alert">{message}</p>}
          <button type="submit" className="button-submit" disabled={pending}>
            {pending ? "Booking..." : "Book my spot"}
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
