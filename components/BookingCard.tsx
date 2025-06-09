import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import React, { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BlurView } from "expo-blur";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function BookingCard({
  booking,
}: {
  booking: {
    _id: Id<"bookings">;
    startDate: string;
    endDate: string;
    note: string | undefined;
    color: string;
    username: string;
  };
}) {
  const [modal, setModal] = useState(false);

  return (
    <View className="w-full">
      <View className="w-full flex flex-row items-center justify-between bg-white rounded-lg border border-slate-600 p-5">
        <View className="flex flex-col itmes-start justify-center">
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
        </View>

        {booking.note && (
          <TouchableOpacity
            onPress={() => setModal(true)}
            className="p-4 bg-slate-800 rounded-lg"
          >
            <Text className="text-white font-semibold">View Note</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modal}
        onRequestClose={() => {
          setModal(false);
        }}
      >
        <BlurView
          intensity={100}
          tint="dark"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <View className="flex-1 flex items-center justify-center">
          <View className="w-[90%] max-h-[80%] -mt-[10%] bg-white rounded-xl p-5 ">
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-col itmes-start justify-center">
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
                    <Text className="font-semibold text-xl">
                      {booking.username}
                    </Text>

                    <View className="flex flex-row items-center justify-center gap-2">
                      <Text className="text-lg font-medium">
                        {booking.startDate}
                      </Text>
                      {booking.endDate !== booking.startDate && (
                        <View className="flex flex-row items-center justify-center gap-2">
                          <FontAwesome6
                            name="angles-right"
                            size={18}
                            color="black"
                          />

                          <Text className="text-lg font-medium">
                            {booking.endDate}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setModal(false)}>
                <MaterialIcons name="cancel" size={30} color="gray" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              className="mt-10"
            >
              <Text className="text-lg">{booking.note}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
