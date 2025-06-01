import { View, Text, Button } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useGroup } from "@/contexts/GroupContext";

export default function Index() {
  const router = useRouter();

  const { setGroupId, setGroupName } = useGroup();

  const handleGroupPress = (groupId: string, groupName: string) => {
    setGroupId(groupId);
    setGroupName(groupName);
    router.replace("/(tabs2)/calendar");
  };

  return (
    <View>
      <Text>index</Text>
      <Button
        title="Group"
        onPress={() => handleGroupPress("id12345", "Duge")}
      />
    </View>
  );
}
