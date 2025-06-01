import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Tabs, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useGroup } from "@/contexts/GroupContext";

export default function TabLayout() {
  const { groupName, setGroupId, setGroupName } = useGroup();

  const router = useRouter();

  const handleBackPress = () => {
    router.replace("/(tabs1)");
    setGroupId(null);
    setGroupName(null);
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="w-full bg-slate-800 p-5">
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBackPress}
          className="flex flex-row items-center justify-center absolute left-5 top-5"
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="white" />
          <Text className="text-lg font-bold text-white">Back</Text>
        </TouchableOpacity>

        {/* Group Name */}
        <Text className="text-2xl font-bold text-white text-center mx-20">
          {" "}
          {groupName}{" "}
        </Text>

        {/* Empty View */}
        <View className="w-16" />
      </View>
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: "fade",
          // tabBarShowLabel: false,
          tabBarActiveTintColor: "#42d4f4",
          tabBarInactiveTintColor: "#f1f5f9",
          tabBarStyle: {
            backgroundColor: "#1e293b",
            paddingTop: 10,
            height: 60,
            elevation: 0,
            paddingBottom: 10,
          },
        }}
      >
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            tabBarIcon: ({ color }) => (
              <MaterialIcons size={28} name="calendar-month" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="members"
          options={{
            title: "Members",
            tabBarIcon: ({ color }) => (
              <FontAwesome6 size={24} name="users" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name="settings-sharp" color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
