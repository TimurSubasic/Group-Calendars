import Loading from "@/components/Loading";
import { useGroup } from "@/contexts/GroupContext";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "convex/react";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function TabLayout() {
  const { groupId, groupName, setGroupId, setGroupName } = useGroup();

  const router = useRouter();

  const handleBackPress = () => {
    router.replace("/(tabs1)");
    setGroupId(null);
    setGroupName(null);
  };

  const { user } = useUser();

  const clerkId = user?.id as string;

  const fullUser = useQuery(
    api.users.getUserByClerk,
    clerkId ? { clerkId } : "skip"
  );

  const groupFound = useQuery(
    api.groupMembers.findGroup,
    fullUser && groupId
      ? {
          groupId: groupId as Id<"groups">,
          userId: fullUser._id,
        }
      : "skip"
  );

  const group = useQuery(
    api.groups.getById,
    groupId
      ? {
          groupId: groupId as Id<"groups">,
        }
      : "skip"
  );

  useEffect(() => {
    if (group && group.name !== groupName) {
      setGroupName(group.name);
    }
    if (groupFound?.found === false) {
      router.replace("/(tabs1)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupFound, group]);

  if (groupFound === undefined || group === undefined) {
    return <Loading />;
  }

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="w-full bg-slate-800 p-5">
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBackPress}
          className="flex flex-row items-center justify-center absolute p-5"
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
              <FontAwesome5 size={24} name="users" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 size={24} name="cogs" color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
