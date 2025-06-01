import { View, Text, ScrollView } from "react-native";
import React from "react";

export default function Members() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="p-5">
        <Text>Members</Text>
      </View>
    </ScrollView>
  );
}
