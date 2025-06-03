import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const NoGroups = () => {
  const { user } = useUser();

  const clerkId = user?.id as string;

  const fullUser = useQuery(
    api.users.getUserByClerk,
    clerkId ? { clerkId } : "skip"
  );

  //dialog box
  const [name, setName] = useState("");

  const [maxBookings, setMaxBookings] = useState(1);

  const [allowJoin, setAllowJoin] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);

  const createGroup = useMutation(api.groups.createGroup);

  const [hasName, setHasName] = useState(true);

  const handlePlus = () => {
    if (maxBookings < 10) {
      setMaxBookings(maxBookings + 1);
    }
  };

  const handleMinus = () => {
    if (maxBookings > 1) {
      setMaxBookings(maxBookings - 1);
    }
  };

  const handleCreate = () => {
    if (name.trim().length >= 2) {
      createGroup({
        name: name,
        userId: fullUser!._id,
        allowJoin: allowJoin,
        maxBookings: maxBookings,
      });
      setModalVisible(false);
    } else {
      setHasName(false);
    }
  };

  useEffect(() => {
    if (name.trim().length >= 2) {
      setHasName(true);
    }
  }, [name]);

  //join group via code
  const [code, setCode] = useState("");
  const [finalCode, setFinalCode] = useState<string | undefined>(undefined);

  const [message, setMessage] = useState("");

  const group = useQuery(
    api.groups.getByCode,
    finalCode ? { joinCode: finalCode } : "skip"
  );

  const handleCodeJoin = () => {
    if (code.length === 6) {
      setFinalCode(code.toUpperCase());
    } else {
      setMessage("Invalid Code");
    }
  };

  const addMember = useMutation(api.groupMembers.addMember);

  useEffect(() => {
    if (group?.success) {
      addMember({
        groupId: group.groupId as Id<"groups">,
        userId: fullUser!._id,
      });
    } else {
      setMessage(group?.message as string);
    }
  }, [group, addMember, fullUser]);

  useEffect(() => {
    setMessage("");
  }, [code]);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      bounces={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1">
        <View className="flex flex-col flex-1 w-full items-center justify-between p-5 my-5">
          <View className="flex flex-col w-full items-start justify-center gap-3">
            <Text className="text-xl font-semibold">Join via Code:</Text>
            <View className="flex flex-row gap-2 w-full">
              <TextInput
                className="p-5 border border-slate-600 rounded-lg w-[65%] "
                placeholder="Code"
                placeholderTextColor={"#475569"}
                onChangeText={(newText) => setCode(newText)}
                defaultValue={code}
              />
              <TouchableOpacity
                onPress={handleCodeJoin}
                className="flex-1 rounded-lg bg-slate-800 p-5"
              >
                <Text className="text-white font-bold text-xl text-center">
                  Join
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-red-500 font-semibold text-md">
              {message}
            </Text>
          </View>

          <View className="flex w-full items-center justify-center my-10">
            <FontAwesome5 size={160} name="users-slash" color={"#1e293b"} />
            <Text className="text-center text-slate-800 uppercase font-bold text-2xl my-5 ">
              You aren&apos;t in any Group
            </Text>
          </View>

          <View className="flex flex-col gap-5 w-full items-center justify-center">
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="w-full rounded-lg bg-slate-800 p-5"
            >
              <Text className="text-white font-bold text-xl text-center">
                Create a Group
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
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
          <View className="w-[90%] -mt-[10%] bg-white rounded-xl p-5 ">
            <View className="flex flex-row items-center justify-between">
              <Text className="font-semibold text-lg">Create a Group</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="cancel" size={30} color="gray" />
              </TouchableOpacity>
            </View>

            <View className="flex flex-col w-full items-start justify-center gap-5 my-10">
              <View className="flex w-full flex-row items-center justify-between">
                <Text className="text-xl font-semibold">Enter Name:</Text>
                <Text className="text-red-500 font-semibold text-md">
                  {hasName ? "" : "Not Valid"}
                </Text>
              </View>
              <TextInput
                className="p-5 border border-slate-600 rounded-lg w-full "
                placeholder="Group Name"
                placeholderTextColor={"#475569"}
                onChangeText={(newText) => setName(newText)}
                defaultValue={name}
              />

              <View className="flex w-full flex-row items-center justify-between">
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

              <View className="flex w-full flex-row items-center justify-between">
                <Text className="text-xl font-semibold">
                  Allow Members to Join:
                </Text>

                <Switch
                  value={allowJoin}
                  trackColor={{ false: "#d1d5db", true: "#64748b" }}
                  thumbColor={allowJoin ? "#1e293b" : "#6b7280"}
                  onValueChange={() => setAllowJoin(!allowJoin)}
                  style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
                />
              </View>
            </View>

            <Text className="text-center text-slate-600 font-bold text-md mt-10 mb-5">
              Settings can be changed later
            </Text>

            <TouchableOpacity
              onPress={handleCreate}
              className="w-full rounded-lg bg-slate-800 p-5"
            >
              <Text className="text-white font-bold text-xl text-center">
                Create
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default NoGroups;
