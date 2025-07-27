import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    color: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // User already exists, return early
      return;
    }

    await ctx.db.insert("users", {
      username: args.username,
      email: args.email,
      color: args.color,
      clerkId: args.clerkId,
    });
  },
});

export const getUserByClerk = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return user;
    }

    return user;
  },
});

export const getById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    return user;
  },
});

export const changeUsername = mutation({
  args: {
    id: v.id("users"),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      username: args.username,
    });
  },
});

export const changeColor = mutation({
  args: {
    id: v.id("users"),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      color: args.color,
    });
  },
});

export const deleteAccount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Find all group memberships for this user
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();

    // For each group, remove the user and check if the group is now empty
    for (const membership of memberships) {
      const groupId = membership.groupId;
      // Remove the membership
      await ctx.db.delete(membership._id);

      // Delete all bookings for this user in this group
      const bookings = await ctx.db
        .query("bookings")
        .withIndex("by_group_and_user", (q) =>
          q.eq("groupId", groupId).eq("userId", userId)
        )
        .collect();
      for (const booking of bookings) {
        await ctx.db.delete(booking._id);
      }

      // Check if the group has any members left
      const remainingMembers = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_id", (q) => q.eq("groupId", groupId))
        .order("asc")
        .collect();

      if (remainingMembers.length === 0) {
        await ctx.db.delete(groupId);
      }

      // If the removed user was an admin, update adminIds
      const group = await ctx.db.get(groupId);

      if (!group) {
        continue;
      }

      const isAdmin = group.adminIds.some((id) => id === userId);
      if (isAdmin) {
        // Remove the user from adminIds
        let newAdminIds = group.adminIds.filter((id) => id !== userId);

        // If no admins left, promote the earliest member to admin
        if (newAdminIds.length === 0) {
          const nextAdminId = remainingMembers[0].userId;
          newAdminIds = [nextAdminId];
        }

        await ctx.db.patch(groupId, { adminIds: newAdminIds });
      }
    }

    // Delete all other bookings by this user (outside of groups, if any)
    const otherBookings = await ctx.db
      .query("bookings")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .collect();
    for (const booking of otherBookings) {
      await ctx.db.delete(booking._id);
    }

    // Finally, delete the user
    // TODO: await ctx.db.delete(userId);
    //TODO: Delete user from clerk
  },
});
