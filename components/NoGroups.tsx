import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-expo";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Dialog from "react-native-dialog";

const NoGroups = () => {
  const { user } = useUser();

  const clerkId = user?.id as string;

  const fullUser = useQuery(
    api.users.getUserByClerk,
    clerkId ? { clerkId } : "skip"
  );

  //dialog box
  const [name, setName] = useState("");

  const [visible, setVisible] = useState(false);

  const createGroup = useMutation(api.groups.createGroup);

  const showDialog = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleCreate = () => {
    if (name.length >= 2) {
      createGroup({
        name: name,
        userId: fullUser!._id,
      });

      setVisible(false);
    }
  };

  //join group via code
  const [code, setCode] = useState("");
  const [finalCode, setFinalCode] = useState<string | undefined>(undefined);

  const [message, setMessage] = useState("");

  const group = useQuery(
    api.groups.getByCode,
    finalCode ? { joinCode: finalCode } : "skip"
  );

  const handleCodeJoin = () => {
    setFinalCode(code.toUpperCase());
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
              onPress={showDialog}
              className="w-full rounded-lg bg-slate-800 p-5"
            >
              <Text className="text-white font-bold text-xl text-center">
                Create a Group
              </Text>
            </TouchableOpacity>

            {/** Dialog box */}
            <Dialog.Container visible={visible}>
              <Dialog.Title>Create Group</Dialog.Title>
              <Dialog.Description>Choose your group name:</Dialog.Description>
              <Dialog.Input onChangeText={setName} />
              <Dialog.Button label="Cancel" onPress={handleCancel} />
              <Dialog.Button label="Create" onPress={handleCreate} />
            </Dialog.Container>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default NoGroups;
