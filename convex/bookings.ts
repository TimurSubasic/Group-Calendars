import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const createBooking = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .collect();

    const group = await ctx.db.get(args.groupId);

    if (!group) {
      return {
        success: false,
        message: "Group not found",
      };
    }

    if (existingBookings.length >= group?.maxBookings) {
      return {
        success: false,
        message: "You have reached the maximum number of bookings",
      };
    }

    await ctx.db.insert("bookings", {
      groupId: args.groupId,
      userId: args.userId,
      note: args.note,
      startDate: args.startDate,
      endDate: args.endDate,
    });

    return {
      success: true,
      message: "Booking created",
    };
  },
});

export const getByGroupId = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    function formatDate(dateStr: string) {
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const [, mm, dd] = dateStr.split("-");
      const monthIndex = parseInt(mm, 10) - 1;
      return `${monthNames[monthIndex]} ${dd}`;
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_group_and_start_date", (q) =>
        q.eq("groupId", args.groupId)
      )
      .order("asc")
      .collect();

    return Promise.all(
      bookings.map(async (booking) => {
        const user = await ctx.db.get(booking.userId);

        return {
          _id: booking._id,
          startDate: formatDate(booking.startDate),
          endDate: formatDate(booking.endDate),
          note: booking.note,
          username: user?.username ?? "Not Found",
          color: user?.color ?? "#000000",
        };
      })
    );
  },
});

export const getUserBookings = query({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .collect();

    return bookings;
  },
});

export const getMarkedDates = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    // Get all bookings for this home
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_group_id", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Create an object to store all marked dates
    const markedDates: {
      [date: string]: {
        color: string;
        selected: boolean;
        startingDay: boolean;
        endingDay: boolean;
      };
    } = {};

    // For each booking, generate marked dates
    for (const booking of bookings) {
      // Get the user's color
      const user = await ctx.db.get(booking.userId);

      if (!user) continue;

      // Generate dates between fromDate and toDate
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split("T")[0];
        markedDates[dateString] = {
          color: user.color,
          selected: true,
          startingDay: dateString === booking.startDate,
          endingDay: dateString === booking.endDate,
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return markedDates;
  },
});

export const deleteBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.bookingId);
  },
});

// delete old bookings
export const deleteOldBookings = internalMutation({
  handler: async (ctx) => {
    const today = new Date().toISOString().slice(0, 10);

    // Efficiently find bookings where toDate < today using the index
    const oldBookings = await ctx.db
      .query("bookings")
      .withIndex("by_end_date", (q) => q.lt("endDate", today))
      .collect();

    for (const booking of oldBookings) {
      await ctx.db.delete(booking._id);
    }
  },
});
