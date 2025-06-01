import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import { GroupProvider } from "@/contexts/GroupContext";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import InitalLayout from "@/components/InitialLayout";

export default function RootLayout() {
  return (
    <ClerkAndConvexProvider>
      <GroupProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: "#1e293b" }}>
            <InitalLayout />
          </SafeAreaView>
        </SafeAreaProvider>
      </GroupProvider>
    </ClerkAndConvexProvider>
  );
}
