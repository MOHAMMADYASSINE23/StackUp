export function normalizeDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  return date.toISOString().split("T")[0];
}

export function normalizeTime(timeString: string): string {
  const match = timeString.trim().match(/^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i);

  if (!match) {
    throw new Error("Invalid time format. Use HH:MM or HH:MM AM/PM");
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[4]?.toUpperCase();

  if (minutes < 0 || minutes > 59) {
    throw new Error("Invalid time values");
  }

  if (period) {
    // A 12-hour clock only accepts hour values from 1 through 12.
    if (hours < 1 || hours > 12) {
      throw new Error("Invalid time values");
    }

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
  } else if (hours < 0 || hours > 23) {
    // Without AM/PM, interpret the input as a 24-hour clock.
    throw new Error("Invalid time values");
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
