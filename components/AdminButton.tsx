import { View, Text, Pressable, Animated } from "react-native";
import React, { useRef } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

interface User {
  _id: Id<"users">;
  _creationTime: number;
  username: string;
  email: string;
  color: string;
  clerkId: string;
}

export default function AdminButton({
  user,
  groupId,
}: {
  user: User | null | undefined;
  groupId: Id<"groups">;
}) {
  const addAdmin = useMutation(api.groups.addAdmin);

  const fillAnim = useRef(new Animated.Value(0)).current;
  const LONG_PRESS_DURATION = 1300;

  const startFill = () => {
    fillAnim.setValue(0);
    Animated.timing(fillAnim, {
      toValue: 1,
      duration: LONG_PRESS_DURATION,
      useNativeDriver: false,
    }).start();
  };

  const resetFill = () => {
    fillAnim.stopAnimation();
    fillAnim.setValue(0);
  };

  const handleLongPress = () => {
    if (!user) return;
    addAdmin({
      groupId: groupId,
      userId: user._id,
    });
  };

  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Pressable
      onPressIn={startFill}
      onPressOut={resetFill}
      onLongPress={handleLongPress}
      delayLongPress={LONG_PRESS_DURATION}
      className="bg-white rounded-lg w-full border-2 border-blue-500"
    >
      <Animated.View
        style={{
          width: fillWidth,
          position: "absolute",
          height: "101%",
          backgroundColor: "#3b82f6",
          left: 0,
          top: 0,
          zIndex: 0,
          borderRadius: "8px",
        }}
      />

      {user && (
        <View className="w-full flex items-center justify-between flex-row p-5 py-3">
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
      )}
    </Pressable>
  );
}
