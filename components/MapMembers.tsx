import { View, Text } from "react-native";
import React from "react";
import { Id } from "@/convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  _creationTime: number;
  username: string;
  email: string;
  color: string;
  clerkId: string;
}

export default function MapMembers({ users }: { users: (User | null)[] }) {
  return (
    <View className="w-full flex flex-col items-center justify-center gap-10 my-5 p-5">
      {users?.map(
        (user, index) =>
          user && (
            <View
              key={index}
              className="w-full flex items-center justify-between flex-row"
            >
              <View className="flex flex-row items-center justify-start gap-3">
                <View
                  style={{ backgroundColor: user.color }}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                >
                  <Text className="text-white text-2xl font-bold">
                    {user.username?.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <Text className="font-semibold text-xl">{user.username}</Text>
              </View>

              <View
                style={{ backgroundColor: user.color }}
                className="p-2.5 rounded-full"
              />
            </View>
          )
      )}
    </View>
  );
}
