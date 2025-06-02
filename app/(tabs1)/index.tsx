import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useGroup } from "@/contexts/GroupContext";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loading from "@/components/Loading";
import NoGroups from "@/components/NoGroups";
import Ionicons from "@expo/vector-icons/Ionicons";
import Dialog from "react-native-dialog";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Id } from "@/convex/_generated/dataModel";

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
  const [visibleCreate, setVisibleCreate] = useState(false);

  const createGroup = useMutation(api.groups.createGroup);

  const showDialogCreate = () => {
    setVisibleCreate(true);
  };

  const handleCancelCreate = () => {
    setVisibleCreate(false);
  };

  const handleCreate = () => {
    if (name.length >= 2) {
      createGroup({
        name: name,
        userId: fullUser!._id,
      });

      setVisibleCreate(false);
    }
  };

  //dialog box join
  const [code, setCode] = useState("");
  const [finalCode, setFinalCode] = useState<string | undefined>(undefined);

  const group = useQuery(
    api.groups.getByCode,
    finalCode ? { joinCode: finalCode } : "skip"
  );

  const [visibleJoin, setVisibleJoin] = useState(false);

  const [body, setBody] = useState("Enter join code");

  // const joinGroup = useMutation(api.groupMembers.joinGroup);

  const showDialogJoin = () => {
    setVisibleJoin(true);
  };

  const handleCancelJoin = () => {
    setVisibleJoin(false);
    setCode("");
    setBody("Enter join code");
  };

  const addMember = useMutation(api.groupMembers.addMember);

  const handleJoin = () => {
    if (code.length === 6) {
      //join group
      // check if code is valid
      // if valid, join group
      // if not valid, show error
      setFinalCode(code.toUpperCase());
      setBody("Joining group...");

      if (group?.success) {
        addMember({
          groupId: group.groupId as Id<"groups">,
          userId: fullUser!._id,
        });
        setVisibleJoin(false);
        setCode("");
        setBody("Enter join code");
      } else {
        setBody("Group not found");
      }
    } else {
      setBody("Invalid join code");
    }
  };

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
          onPress={showDialogCreate}
          className="flex-1 flex-row items-center justify-between rounded-lg bg-slate-800 px-7 py-3"
        >
          <Text className="text-white font-bold text-xl text-center">
            Create
          </Text>
          <Ionicons name="create" size={40} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={showDialogJoin}
          className="flex-1 flex-row items-center justify-between rounded-lg bg-slate-800 px-7 py-3"
        >
          <Text className="text-white font-bold text-xl text-center">Join</Text>
          <Ionicons name="enter" size={40} color="white" />
        </TouchableOpacity>
      </View>

      {/** Dialog box */}
      <Dialog.Container visible={visibleCreate}>
        <Dialog.Title>Create Group</Dialog.Title>
        <Dialog.Description>Choose your group name:</Dialog.Description>
        <Dialog.Input onChangeText={setName} />
        <Dialog.Button label="Cancel" onPress={handleCancelCreate} />
        <Dialog.Button label="Create" onPress={handleCreate} />
      </Dialog.Container>

      <Dialog.Container visible={visibleJoin}>
        <Dialog.Title>Join Group</Dialog.Title>
        <Dialog.Description>{body}</Dialog.Description>
        <Dialog.Input onChangeText={setCode} />
        <Dialog.Button label="Cancel" onPress={handleCancelJoin} />
        <Dialog.Button label="Join" onPress={handleJoin} />
      </Dialog.Container>
    </View>
  );
}
