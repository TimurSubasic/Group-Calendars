import { v } from "convex/values";
import { query } from "./_generated/server";

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
