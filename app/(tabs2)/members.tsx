import KickButton from "@/components/KickButton";
import Loading from "@/components/Loading";
import MapMembers from "@/components/MapMembers";
import { useGroup } from "@/contexts/GroupContext";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-expo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQuery } from "convex/react";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast, { BaseToast } from "react-native-toast-message";

export default function Members() {
  const { groupId } = useGroup();

  const members = useQuery(api.groupMembers.getMembers, {
    groupId: groupId as Id<"groups">,
  });

  const group = useQuery(api.groups.getById, {
    groupId: groupId as Id<"groups">,
  });

  const nonAdmins = useQuery(api.groupMembers.getNonAdmins, {
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

  const [modal, setModal] = useState(false);

  const animatedHeightKick = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (nonAdmins === undefined) {
      return;
    }
    const shouldShow = nonAdmins.length > 0;

    Animated.timing(animatedHeightKick, {
      toValue: shouldShow ? 60 : 0, // adjust to your button height
      duration: 300,
      useNativeDriver: false, // height can't use native driver
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonAdmins]);

  if (
    group === undefined ||
    members === undefined ||
    isAdmin === undefined ||
    nonAdmins === undefined
  ) {
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

              <MapMembers users={members} />
            </View>
          </View>
        </ScrollView>
      </View>

      {/* buttons */}

      <View className="w-full flex flex-col items-center justify-center gap-3 pt-4 p-5">
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
          <Animated.View
            style={{
              height: animatedHeightKick,
              overflow: "hidden",
              width: "100%",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setModal(true);
              }}
              className="w-full rounded-lg bg-red-600 p-5"
            >
              <Text className="text-white font-bold text-xl text-center">
                Kick Members
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <Toast config={toastConfig} />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modal}
        onRequestClose={() => {
          setModal(false);
        }}
      >
        <BlurView
          intensity={100}
          tint="dark"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <View className="flex-1 flex items-center justify-center">
          <View className="w-[90%] max-h-[80%] -mt-[10%] bg-white rounded-xl p-5 ">
            <View className="flex flex-row items-center justify-between">
              <Text className="font-bold text-2xl">Kick Members</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <MaterialIcons name="cancel" size={30} color="gray" />
              </TouchableOpacity>
            </View>

            {nonAdmins.length === 0 ? (
              <Text className="text-center text-gray-500 text-lg mt-5">
                No members to kick
              </Text>
            ) : (
              <Text className="text-center text-gray-500 text-lg mt-5">
                Press and hold to kick
              </Text>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              bounces={false}
            >
              <View className="flex flex-col w-full items-start justify-center gap-5 my-10">
                {nonAdmins &&
                  nonAdmins.map((user, index) => (
                    <KickButton
                      key={index}
                      user={user}
                      groupId={groupId as Id<"groups">}
                    />
                  ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
