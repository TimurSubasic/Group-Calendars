import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getGroupsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    return await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);

        return {
          groupId: membership.groupId,
          userId: membership.userId,
          name: group?.name ?? null,
        };
      })
    );
  },
});

export const addMember = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existingMember = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (existingMember) {
      return {
        success: false,
        message: "User already in group",
      };
    }

    await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      userId: args.userId,
    });

    return {
      success: true,
      message: "You have joined the group",
    };
  },
});

export const getMembers = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_id", (q) => q.eq("groupId", args.groupId))
      .collect();

    return await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);

        return user;
      })
    );
  },
});

export const getNonAdmins = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_id", (q) => q.eq("groupId", args.groupId))
      .collect();

    const group = await ctx.db.get(args.groupId);

    if (!group) {
      return [];
    }
    // Fetch all admin user documents in parallel
    const admins = await Promise.all(
      group.adminIds.map((userId) => ctx.db.get(userId))
    );

    const nonAdmins = members.filter((member) => {
      const isAdmin = admins.some((admin) => admin?._id === member.userId);
      return !isAdmin;
    });

    const nonAdminsWithUser = await Promise.all(
      nonAdmins.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return user;
      })
    );
    return nonAdminsWithUser;
  },
});

export const findGroup = query({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!group) {
      return {
        found: false,
      };
    }
    return {
      found: true,
    };
  },
});

export const removeMember = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Find the group
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      return { success: false, message: "Group not found" };
    }

    // Find the member document
    const member = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!member) {
      return { success: false, message: "User not in group" };
    }

    // Remove the member
    await ctx.db.delete(member._id);

    // Delete all bookings for removed member
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .collect();

    if (bookings.length > 0) {
      for (const booking of bookings) {
        await ctx.db.delete(booking._id);
      }
    }

    // Fetch all remaining members in the group, ordered by _creationTime
    const remainingMembers = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_id", (q) => q.eq("groupId", args.groupId))
      .order("asc") // Ascending by _creationTime
      .collect();

    // If no members left, delete the group
    if (remainingMembers.length === 0) {
      await ctx.db.delete(args.groupId);
      return {
        success: true,
        message: "User removed and group deleted (last member)",
      };
    }

    // If the removed user was an admin, update adminIds
    const isAdmin = group.adminIds.some((id) => id === args.userId);
    if (isAdmin) {
      // Remove the user from adminIds
      let newAdminIds = group.adminIds.filter((id) => id !== args.userId);

      // If no admins left, promote the earliest member to admin
      if (newAdminIds.length === 0) {
        const nextAdminId = remainingMembers[0].userId;
        newAdminIds = [nextAdminId];
      }

      await ctx.db.patch(args.groupId, { adminIds: newAdminIds });
    }

    return { success: true, message: "User removed from group" };
  },
});
