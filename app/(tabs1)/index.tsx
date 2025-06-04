import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useGroup } from "@/contexts/GroupContext";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loading from "@/components/Loading";
import NoGroups from "@/components/NoGroups";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Id } from "@/convex/_generated/dataModel";
import { BlurView } from "expo-blur";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function Index() {
  const router = useRouter();

  const { setGroupId, setGroupName } = useGroup();

  const handleGroupPress = (groupId: string, groupName: string) => {
    setGroupId(groupId);
    setGroupName(groupName);
    router.replace("/(tabs2)/calendar");
  };

  const { user } = useUser();

  const clerkId = user?.id as string;

  const fullUser = useQuery(
    api.users.getUserByClerk,
    clerkId ? { clerkId } : "skip"
  );

  const groups = useQuery(
    api.groupMembers.getGroupsByUser,
    fullUser
      ? {
          userId: fullUser._id,
        }
      : "skip"
  );

  //dialog box create
  const [name, setName] = useState("");

  const [maxBookings, setMaxBookings] = useState(1);

  const [allowJoin, setAllowJoin] = useState(true);

  const [modalCreate, setModalCreate] = useState(false);

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
      setModalCreate(false);
    } else {
      setHasName(false);
    }
  };

  useEffect(() => {
    if (name.trim().length >= 2) {
      setHasName(true);
    }
  }, [name]);

  //dialog box join
  const [code, setCode] = useState("");
  const [finalCode, setFinalCode] = useState<string | undefined>(undefined);

  const [modalJoin, setModalJoin] = useState(false);

  const group = useQuery(
    api.groups.getByCode,
    finalCode ? { joinCode: finalCode } : "skip"
  );

  const [body, setBody] = useState("Enter join code");

  // const joinGroup = useMutation(api.groupMembers.joinGroup);

  const addMember = useMutation(api.groupMembers.addMember);

  const handleJoin = () => {
    if (code.length === 6) {
      setFinalCode(code.toUpperCase());
    } else {
      setBody("Invalid Code");
    }
  };

  useEffect(() => {
    if (group?.success) {
      addMember({
        groupId: group.groupId as Id<"groups">,
        userId: fullUser!._id,
      });
      setModalJoin(false);
    } else {
      setBody(group?.message as string);
    }
  }, [group, addMember, fullUser]);

  useEffect(() => {
    setBody("");
  }, [code]);

  if (groups === undefined) {
    return <Loading />;
  }

  if (groups.length === 0) {
    return <NoGroups />;
  }

  return (
    <View className="w-full flex-1 flex-col items-center justify-between">
      {/* Main content */}
      <View className="w-full flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingTop: 20, padding: 20 }}
        >
          <View className="flex flex-col w-full items-center justify-center gap-5">
            {groups.map((group, index) => (
              <TouchableOpacity
                key={index}
                className="p-4 px-8 rounded-lg bg-white shadow-lg w-full flex flex-row items-center justify-between border border-slate-600"
                onPress={() =>
                  handleGroupPress(group.groupId, group.name as string)
                }
              >
                <Text className="text-xl text-slate-800 font-bold">
                  {group.name}
                </Text>
                <MaterialIcons
                  size={40}
                  name="calendar-month"
                  color={"#1e293b"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* buttons */}
      <View className="w-full flex flex-row items-center justify-center gap-3 border-t-2 border-slate-800 pt-4 p-5">
        <TouchableOpacity
          onPress={() => setModalCreate(true)}
          className="flex-1 flex-row items-center justify-between rounded-lg bg-slate-800 px-7 py-3"
        >
          <Text className="text-white font-bold text-xl text-center">
            Create
          </Text>
          <Ionicons name="create" size={40} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setModalJoin(true)}
          className="flex-1 flex-row items-center justify-between rounded-lg bg-slate-800 px-7 py-3"
        >
          <Text className="text-white font-bold text-xl text-center">Join</Text>
          <Ionicons name="enter" size={40} color="white" />
        </TouchableOpacity>
      </View>

      {/** Modals */}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalCreate}
        onRequestClose={() => {
          setModalCreate(false);
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
              <TouchableOpacity onPress={() => setModalCreate(false)}>
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

              <View className="flex w-full flex-row items-center justify-between my-5">
                <Text className="text-xl font-semibold">
                  Bookins per Member:
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

              <View className="flex w-full flex-row items-center justify-between my-5">
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalJoin}
        onRequestClose={() => {
          setModalJoin(false);
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
              <Text className="font-semibold text-lg">Join Via Code</Text>
              <TouchableOpacity onPress={() => setModalJoin(false)}>
                <MaterialIcons name="cancel" size={30} color="gray" />
              </TouchableOpacity>
            </View>

            <View className="flex flex-row gap-2 w-full mt-10">
              <TextInput
                className="p-5 border border-slate-600 rounded-lg w-[65%] "
                placeholder="Code"
                placeholderTextColor={"#475569"}
                onChangeText={(newText) => setCode(newText)}
                defaultValue={code}
              />
              <TouchableOpacity
                onPress={handleJoin}
                className="flex-1 rounded-lg bg-slate-800 p-5"
              >
                <Text className="text-white font-bold text-xl text-center">
                  Join
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-red-500 font-semibold text-md mt-3">
              {body}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
