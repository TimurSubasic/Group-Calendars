import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
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
  );
}
