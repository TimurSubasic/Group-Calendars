import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { GroupProvider } from "@/contexts/GroupContext";

export default function RootLayout() {
  return (
    <GroupProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1e293b" }}>
        <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      </SafeAreaView>
    </GroupProvider>
  );
}
