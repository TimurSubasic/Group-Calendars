import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "delete old bookings",
  { hourUTC: 0, minuteUTC: 0 }, // Runs every day at midnight UTC
  internal.bookings.deleteOldBookings
);

export default crons;
