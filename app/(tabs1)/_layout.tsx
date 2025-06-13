import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Tabs, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function TabLayout() {
  const segments = useSegments();

  const [header, setHeader] = useState("Your Groups");

  useEffect(() => {
    if (segments[1] === "settings") {
      setHeader("Settings");
    } else {
      setHeader("Your Groups");
    }
  }, [segments]);

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="w-full bg-slate-800 p-5">
        {/* Group Name */}
        <Text className="text-2xl font-bold text-white text-center mx-20">
          {header}
        </Text>
      </View>
      <Tabs
        screenOptions={{
          animation: "fade",
          headerShown: false,
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
          name="index"
          options={{
            title: "Groups",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 size={24} name="users" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 size={24} name="cog" color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
