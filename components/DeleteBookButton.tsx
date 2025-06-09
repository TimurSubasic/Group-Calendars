import { View, Text, Pressable, Animated } from "react-native";
import React, { useRef } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import FontAwesome6 from "@expo/vector-icons/build/FontAwesome6";

interface Booking {
  _id: Id<"bookings">;
  startDate: string;
  endDate: string;
  note: string | undefined;
  username: string;
  color: string;
}

export default function DeleteBookButton({
  booking,
}: {
  booking: Booking | null | undefined;
}) {
  const deleteBooking = useMutation(api.bookings.deleteBooking);

  const fillAnim = useRef(new Animated.Value(0)).current;
  const LONG_PRESS_DURATION = 1000;

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
    if (booking === null || booking === undefined) return;
    deleteBooking({
      bookingId: booking._id,
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
      className="bg-white rounded-lg w-full border-2 border-red-500"
    >
      <Animated.View
        style={{
          width: fillWidth,
          position: "absolute",
          height: "101%",
          backgroundColor: "#ef4444",
          left: 0,
          top: 0,
          zIndex: 0,
          borderRadius: "8px",
        }}
      />

      {booking && (
        <View className="w-full flex items-center justify-between flex-row p-5 py-3">
          <View className="flex flex-row items-center justify-start gap-3">
            <View
              style={{ backgroundColor: booking.color }}
              className="w-14 h-14 rounded-full flex items-center justify-center"
            >
              <Text className="text-white text-2xl font-bold">
                {booking.username?.slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View className="flex flex-col items-start justify-center">
              <Text className="font-semibold text-xl">{booking.username}</Text>

              <View className="flex flex-row items-center justify-center gap-2">
                <Text className="text-lg font-medium">{booking.startDate}</Text>
                {booking.endDate !== booking.startDate && (
                  <View className="flex flex-row items-center justify-center gap-2">
                    <FontAwesome6 name="angles-right" size={18} color="black" />

                    <Text className="text-lg font-medium">
                      {booking.endDate}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View
            style={{ backgroundColor: booking.color }}
            className="p-2.5 rounded-full"
          />
        </View>
      )}
    </Pressable>
  );
}
