import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function generateJoinCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const createGroup = mutation({
  args: {
    name: v.string(),
    userId: v.id("users"),
    allowJoin: v.boolean(),
    maxBookings: v.number(),
  },
  handler: async (ctx, args) => {
    let joinCode = undefined;
    let existing;

    // if group allows join, generate a join code
    if (args.allowJoin) {
      // Try max 10 times to find a unique code
      for (let i = 0; i < 10; i++) {
        const code = generateJoinCode().toUpperCase();
        existing = await ctx.db
          .query("groups")
          .withIndex("by_join_code", (q) => q.eq("joinCode", code))
          .first();

        if (!existing) {
          joinCode = code;
          break;
        }
      }

      if (!joinCode) {
        return {
          success: false,
          message: "Join code failed to generate",
        };
      }
    }

    // create group
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      adminIds: [args.userId],
      joinCode: joinCode,
      allowJoin: args.allowJoin,
      maxBookings: args.maxBookings,
    });

    // create group member
    await ctx.db.insert("groupMembers", {
      groupId: groupId,
      userId: args.userId,
    });

    return {
      success: true,
      message: "Group created successfully",
      groupId: groupId,
    };
  },
});

export const getByCode = query({
  args: {
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db
      .query("groups")
      .withIndex("by_join_code", (q) =>
        q.eq("joinCode", args.joinCode.toUpperCase())
      )
      .first();

    if (!group) {
      return {
        success: false,
        message: "Group not found",
      };
    }

    return {
      success: true,
      message: "Group found",
      groupId: group._id,
    };
  },
});

export const getById = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);

    if (!group) {
      return group;
    }

    return group;
  },
});

export const validateGroup = query({
  args: { groupId: v.string() },
  handler: async (ctx, { groupId }) => {
    const normalizedId = ctx.db.normalizeId("groups", groupId);
    if (!normalizedId)
      return {
        success: false,
        message: "Invalid ID",
      };

    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      return {
        success: false,
        message: "User not authenticated",
      };

    // Find the user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user)
      return {
        success: false,
        message: "User not found",
      };

    // Check group membership
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", normalizedId).eq("userId", user._id)
      )
      .unique();
    if (!membership)
      return {
        success: false,
        message: "User not in group",
      };
    return {
      success: true,
    };
  },
});

export const getAdmins = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      return [];
    }
    // Fetch all admin user documents in parallel
    const users = await Promise.all(
      group.adminIds.map((userId) => ctx.db.get(userId))
    );

    return users;
  },
});

export const isAdmin = query({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    return (group?.adminIds ?? []).includes(args.userId);
  },
});

export const changeName = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      return { success: false, message: "Group not found" };
    }
    await ctx.db.patch(args.groupId, {
      name: args.name,
    });
    return { success: true, message: "Name updated" };
  },
});

export const addAdmin = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      return { success: false, message: "Group not found" };
    }
    // Avoid adding duplicate admin
    if (group.adminIds.includes(args.userId)) {
      return { success: false, message: "User is already an admin" };
    }
    await ctx.db.patch(args.groupId, {
      adminIds: [...group.adminIds, args.userId],
    });
    return { success: true, message: "Admin added" };
  },
});

export const updateMaxBookings = mutation({
  args: {
    groupId: v.id("groups"),
    maxBookings: v.number(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      return { success: false, message: "Group not found" };
    }
    await ctx.db.patch(args.groupId, {
      maxBookings: args.maxBookings,
    });
    return { success: true, message: "Max bookings updated" };
  },
});

export const updateAllowJoin = mutation({
  args: {
    groupId: v.id("groups"),
    allowJoin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      return { success: false, message: "Group not found" };
    }

    let joinCode = undefined;
    let existing;

    if (args.allowJoin) {
      // Try max 10 times to find a unique code
      for (let i = 0; i < 10; i++) {
        const code = generateJoinCode().toUpperCase();
        existing = await ctx.db
          .query("groups")
          .withIndex("by_join_code", (q) => q.eq("joinCode", code))
          .first();

        if (!existing) {
          joinCode = code;
          break;
        }
      }

      if (!joinCode) {
        return {
          success: false,
          message: "Join code failed to generate",
        };
      }
    }

    await ctx.db.patch(args.groupId, {
      joinCode: joinCode,
      allowJoin: args.allowJoin,
    });
    return { success: true, message: "Allow join updated" };
  },
});

export const deleteGroup = mutation({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    // Delete all groupMembers with this groupId
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_id", (q) => q.eq("groupId", args.groupId))
      .collect();

    if (!members) {
      return { success: false, message: "No members found" };
    }

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // get all bookings with this groupId
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_group_id", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const booking of bookings) {
      await ctx.db.delete(booking._id);
    }

    // Delete the group itself
    await ctx.db.delete(args.groupId);

    return { success: true, message: "Group deleted" };
  },
});
