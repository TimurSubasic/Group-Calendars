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
