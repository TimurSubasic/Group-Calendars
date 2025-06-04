import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useGroup } from "@/contexts/GroupContext";
import { Id } from "@/convex/_generated/dataModel";
import * as Clipboard from "expo-clipboard";
import Loading from "@/components/Loading";
import Toast, { BaseToast } from "react-native-toast-message";
import { useUser } from "@clerk/clerk-expo";

export default function Members() {
  const { groupId } = useGroup();

  const members = useQuery(api.groupMembers.getMembers, {
    groupId: groupId as Id<"groups">,
  });

  const group = useQuery(api.groups.getById, {
    groupId: groupId as Id<"groups">,
  });

  const { user } = useUser();

  const clerkId = user?.id as string;

  const fullUser = useQuery(
    api.users.getUserByClerk,
    clerkId ? { clerkId } : "skip"
  );

  const isAdmin = useQuery(
    api.groups.isAdmin,
    fullUser
      ? { userId: fullUser._id, groupId: groupId as Id<"groups"> }
      : "skip"
  );

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: "#1e293b", borderLeftWidth: 10 }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{ fontSize: 18 }}
        text2Style={{ fontSize: 16 }}
      />
    ),
  };

  const handleAdd = async () => {
    await Clipboard.setStringAsync(group?.joinCode as string);

    Toast.show({
      type: "success",
      text1: group!.joinCode as string,
      text2: "Coppied, send it to your friends!",
      position: "top",
      visibilityTime: 4500,
    });
  };

  if (group === undefined || members === undefined || isAdmin === undefined) {
    return <Loading />;
  }

  return (
    <View className="w-full flex-1 flex-col items-center justify-between">
      {/* Main content */}
      <View className="w-full flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="p-5">
            {/* Members View Box */}
            <View className=" border border-slate-600 rounded-lg bg-white w-full">
              <Text className="text-3xl font-semibold text-center my-5">
                Members
              </Text>

              <View className="w-full flex flex-col items-center justify-center gap-5 my-3 mb-10">
                {members?.map((user, index) => (
                  <View
                    key={index}
                    className="w-full flex items-center justify-between flex-row"
                  >
                    <View className="flex flex-row items-center justify-center gap-3">
                      <View
                        style={{ backgroundColor: user.color as string }}
                        className="w-[50px] h-[50px] rounded-full flex items-center justify-center"
                      >
                        <Text className="text-white text-2xl font-bold">
                          {user.username?.slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                      <Text className="font-semibold text-xl bg-white p-5 w-[45%] rounded-r-full">
                        {user.username}
                      </Text>
                    </View>

                    <View
                      style={{ backgroundColor: user.color as string }}
                      className="p-2.5 mr-5 rounded-full"
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* buttons */}
      <View className="w-full flex flex-col items-center justify-center gap-3 border-t-2 border-slate-800 pt-4 p-5">
        {group?.allowJoin && (
          <TouchableOpacity
            onPress={handleAdd}
            className="w-full flex-row items-center justify-center rounded-lg bg-slate-800 p-5"
          >
            <Text className="text-white font-bold text-xl text-center">
              Add Members
            </Text>
          </TouchableOpacity>
        )}

        {isAdmin && (
          <TouchableOpacity
            onPress={() => {
              /* leave group */
            }}
            className="w-full rounded-lg bg-red-600 p-5"
          >
            <Text className="text-white font-bold text-xl text-center">
              Kick Members
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Toast config={toastConfig} />
    </View>
  );
}
