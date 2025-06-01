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
  },
  handler: async (ctx, args) => {
    let joinCode;
    let existing;

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

    // create group
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      adminIds: [args.userId],
      joinCode: joinCode,
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
      .withIndex("by_join_code", (q) => q.eq("joinCode", args.joinCode))
      .first();

    if (!group) {
      return {
        success: false,
        message: "Group not found",
      };
    }

    return group;
  },
});

export const getById = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);

    if (!group) {
      return {
        success: false,
        message: "Group not found",
      };
    }

    return group;
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

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Delete the group itself
    await ctx.db.delete(args.groupId);
  },
});
