import { View, Text, ScrollView } from "react-native";
import React from "react";

export default function Bookings() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="p-5">
        <Text>Calendar</Text>
      </View>
    </ScrollView>
  );
}
