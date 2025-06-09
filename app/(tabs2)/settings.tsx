import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  Animated,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useGroup } from "@/contexts/GroupContext";
import { Id } from "@/convex/_generated/dataModel";
import Loading from "@/components/Loading";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import MapMembers from "@/components/MapMembers";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AdminButton from "@/components/AdminButton";

export default function Settings() {
  const router = useRouter();
  const { groupId, groupName, setGroupName } = useGroup();

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

  const group = useQuery(
    api.groups.getById,
    groupId ? { groupId: groupId as Id<"groups"> } : "skip"
  );

  const admins = useQuery(
    api.groups.getAdmins,
    groupId ? { groupId: groupId as Id<"groups"> } : "skip"
  );

  const nonAdmins = useQuery(
    api.groupMembers.getNonAdmins,
    groupId ? { groupId: groupId as Id<"groups"> } : "skip"
  );

  const updateMaxBookings = useMutation(api.groups.updateMaxBookings);

  const updateAllowJoin = useMutation(api.groups.updateAllowJoin);

  const changeName = useMutation(api.groups.changeName);

  const [name, setName] = useState("");

  const [allowJoin, setAllowJoin] = useState<boolean>(false);

  const [maxBookings, setMaxBookings] = useState<number | undefined>(undefined);
  const animatedHeightSave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shouldShow = maxBookings !== group?.maxBookings;

    Animated.timing(animatedHeightSave, {
      toValue: shouldShow ? 60 : 0, // adjust to your button height
      duration: 300,
      useNativeDriver: false, // height can't use native driver
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxBookings, group?.maxBookings]);

  const animatedHeightAdd = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shouldShow = nonAdmins?.length !== 0;

    Animated.timing(animatedHeightAdd, {
      toValue: shouldShow ? 60 : 0, // adjust to your button height
      duration: 300,
      useNativeDriver: false, // height can't use native driver
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonAdmins]);

  // Effect to update database when debounced value changes
  const saveMaxBookings = () => {
    updateMaxBookings({
      groupId: groupId as Id<"groups">,
      maxBookings: maxBookings as number,
    });
  };

  const handlePlus = () => {
    if (maxBookings && maxBookings < 10) {
      setMaxBookings(maxBookings + 1);
    }
  };

  const handleMinus = () => {
    if (maxBookings && maxBookings > 1) {
      setMaxBookings(maxBookings - 1);
    }
  };

  const handleNameChange = async () => {
    if (name.trim().length >= 2) {
      const result = await changeName({
        groupId: groupId as Id<"groups">,
        name: name,
      });

      if (result.success) {
        setGroupName(name);
        setName("");
      }
    }
  };

  useEffect(() => {
    if (group !== undefined) {
      setMaxBookings(group?.maxBookings as number);
      setAllowJoin(group?.allowJoin as boolean);
    }
  }, [group]);

  const removeMember = useMutation(api.groupMembers.removeMember);

  const handleLeave = async () => {
    const result = await removeMember({
      groupId: groupId as Id<"groups">,
      userId: fullUser?._id as Id<"users">,
    });

    if (result.success) {
      router.replace("/(tabs1)");
    }
  };

  const [modalDelete, setModalDelete] = useState(false);

  const deleteGroup = useMutation(api.groups.deleteGroup);

  const handleDelete = async () => {
    const result = await deleteGroup({
      groupId: groupId as Id<"groups">,
    });

    if (result.success) {
      router.replace("/(tabs1)");
    }
  };

  const [modalAddAdmin, setModalAddAdmin] = useState(false);

  if (
    isAdmin === undefined ||
    admins === undefined ||
    group === undefined ||
    nonAdmins === undefined
  ) {
    return <Loading />;
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="p-5 flex-1">
        <View className="flex-1 flex-col items-center justify-between w-full">
          {/* main content */}

          {isAdmin ? (
            <View className="w-full flex flex-col items-center justify-center gap-5">
              <View className="felx flex-col items-start justify-center gap-3 w-full">
                <Text className="text-xl font-semibold">
                  Change Group Name:{" "}
                </Text>
                <View className="flex flex-row gap-2 w-full">
                  <TextInput
                    className="p-5 border border-slate-600 rounded-lg w-[65%] "
                    placeholder={groupName as string}
                    placeholderTextColor={"#475569"}
                    onChangeText={(newText) => setName(newText)}
                    defaultValue={name}
                  />
                  <TouchableOpacity
                    onPress={handleNameChange}
                    className="flex-1 rounded-lg bg-slate-800 p-5"
                  >
                    <Text className="text-white font-bold text-xl text-center">
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* show admins */}

              {/* Admins View Box */}
              <View className=" border border-slate-600 rounded-lg bg-white w-full">
                <Text className="text-3xl font-semibold text-center my-5">
                  Admins
                </Text>

                <MapMembers users={admins} />
              </View>

              <Animated.View
                style={{
                  height: animatedHeightAdd,
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setModalAddAdmin(true);
                  }}
                  className="w-full rounded-lg bg-slate-800 p-5"
                >
                  <Text className="text-white font-bold text-xl text-center">
                    Add Admins
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <View className="flex w-full flex-row items-center justify-between my-5">
                <Text className="text-xl font-semibold">
                  Bookings per Member:
                </Text>

                <View className="flex flex-row items-center justify-center border border-slate-600 rounded-lg">
                  <TouchableOpacity
                    onPress={handleMinus}
                    className="border-r border-slate-600 p-2 "
                  >
                    <FontAwesome5 name="minus" size={20} color={"#1e293b"} />
                  </TouchableOpacity>

                  <Text className="text-xl font-semibold w-10 text-center">
                    {maxBookings}
                  </Text>

                  <TouchableOpacity
                    onPress={handlePlus}
                    className="border-l border-slate-600 p-2"
                  >
                    <FontAwesome5 name="plus" size={20} color={"#1e293b"} />
                  </TouchableOpacity>
                </View>
              </View>

              <Animated.View
                style={{
                  height: animatedHeightSave,
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  onPress={saveMaxBookings}
                  className="w-full rounded-lg bg-slate-800 p-5"
                >
                  <Text className="text-white font-bold text-xl text-center">
                    Save
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <View className="flex w-full flex-row items-center justify-between my-5">
                <Text className="text-xl font-semibold">
                  Allow Members to Join:
                </Text>

                <Switch
                  value={allowJoin}
                  trackColor={{ false: "#d1d5db", true: "#64748b" }}
                  thumbColor={allowJoin ? "#1e293b" : "#6b7280"}
                  onValueChange={() => {
                    updateAllowJoin({
                      groupId: groupId as Id<"groups">,
                      allowJoin: !allowJoin,
                    });
                    setAllowJoin(!allowJoin);
                  }}
                  style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
                />
              </View>
            </View>
          ) : (
            <View className="w-full flex flex-col items-center justify-center gap-5">
              <Text className="text-xl font-semibold text-center my-5">
                Only Admins can change group settings
              </Text>

              <View className=" border border-slate-600 rounded-lg bg-white w-full">
                <Text className="text-3xl font-semibold text-center my-5">
                  Admins
                </Text>

                <MapMembers users={admins} />
              </View>
            </View>
          )}

          {/* leave group btn */}
          <View className="w-full flex flex-col items-center justify-center gap-5 mt-10">
            <TouchableOpacity
              onPress={handleLeave}
              className="w-full rounded-lg bg-red-600 p-5"
            >
              <Text className="text-white font-bold text-xl text-center">
                Leave Group
              </Text>
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity
                onPress={() => {
                  setModalDelete(true);
                }}
                className="w-full rounded-lg bg-red-600 p-5"
              >
                <Text className="text-white font-bold text-xl text-center">
                  Delete Group
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalDelete}
        onRequestClose={() => {
          setModalDelete(false);
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
          <View className="w-[80%] -mt-[10%] bg-white rounded-xl p-5 ">
            <Text className="text-2xl font-bold text-center">
              Delete This Group
            </Text>

            <Text className="text-lg font-semibold text-gray-500 text-center">
              This action can not be undone
            </Text>

            <View className="flex flex-row w-full mt-10 gap-3">
              <TouchableOpacity
                onPress={() => setModalDelete(false)}
                className="p-5 bg-slate-800 rounded-lg flex-1"
              >
                <Text className="text-center text-white font-bold text-xl ">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                className="p-5 bg-red-600 rounded-lg flex-1"
              >
                <Text className="text-center text-white font-bold text-xl ">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalAddAdmin}
        onRequestClose={() => {
          setModalAddAdmin(false);
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
              <Text className="font-bold text-2xl">Add Admins</Text>
              <TouchableOpacity onPress={() => setModalAddAdmin(false)}>
                <MaterialIcons name="cancel" size={30} color="gray" />
              </TouchableOpacity>
            </View>

            {nonAdmins.length === 0 ? (
              <Text className="text-center text-gray-500 text-lg mt-5">
                No members to add as admins
              </Text>
            ) : (
              <View>
                <Text className="text-center text-gray-500 text-lg mt-5">
                  Press and hold to add as admin
                </Text>
                <Text className="text-center text-gray-500 text-lg">
                  Admins can not be removed
                </Text>
              </View>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View className="flex flex-col w-full items-start justify-center gap-5 my-10">
                {nonAdmins &&
                  nonAdmins.map((user, index) => (
                    <AdminButton
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
    </ScrollView>
  );
}
