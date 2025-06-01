import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    email: v.string(),
    color: v.string(),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  groups: defineTable({
    name: v.string(),
    adminIds: v.array(v.id("users")),
    joinCode: v.string(),
  }).index("by_join_code", ["joinCode"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
  })
    .index("by_group_id", ["groupId"])
    .index("by_user_id", ["userId"]),

  bookings: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    note: v.optional(v.string()),
    startDate: v.string(),
    endDate: v.string(),
  })
    .index("by_group_id", ["groupId"])
    .index("by_user_id", ["userId"])
    .index("by_group_id_and_user_id", ["groupId", "userId"]),
});
