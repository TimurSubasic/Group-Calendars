import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useGroup } from "@/contexts/GroupContext";
import { Id } from "@/convex/_generated/dataModel";
import Dialog from "react-native-dialog";
import * as Clipboard from "expo-clipboard";
import Loading from "@/components/Loading";

export default function Members() {
  const { groupId } = useGroup();

  const members = useQuery(api.groupMembers.getMembers, {
    groupId: groupId as Id<"groups">,
  });

  const group = useQuery(api.groups.getById, {
    groupId: groupId as Id<"groups">,
  });

  const [visibleAdd, setVisibleAdd] = useState(false);

  const showDialogAdd = () => {
    setVisibleAdd(true);
  };

  const handleCancelAdd = () => {
    setVisibleAdd(false);
  };

  const handleAdd = async () => {
    await Clipboard.setStringAsync(group?.joinCode as string);
    setVisibleAdd(false);
  };

  if (group === undefined || members === undefined) {
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

              <View className="flex flex-col items-center justify-center gap-5 my-3 mb-10">
                {members?.map((users, index) => (
                  <View
                    key={index}
                    className={` w-full flex items-start justify-start `}
                    style={{ backgroundColor: users.color as string }}
                  >
                    <Text className="font-semibold text-xl bg-white p-3 w-[35%] rounded-r-full">
                      {users.username}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* buttons */}
      <View className="w-full flex flex-row items-center justify-center gap-3 border-t-2 border-slate-800 pt-4 p-5">
        <TouchableOpacity
          onPress={showDialogAdd}
          className="flex-1 flex-row items-center justify-center rounded-lg bg-slate-800 p-5"
        >
          <Text className="text-white font-bold text-xl text-center">
            Add Members
          </Text>
        </TouchableOpacity>
      </View>

      {/*  Dialog  */}
      <Dialog.Container visible={visibleAdd}>
        <Dialog.Title>{group?.joinCode}</Dialog.Title>
        <Dialog.Description>
          Click the copy button and send it to your family!
        </Dialog.Description>
        <Dialog.Button label="Cancel" onPress={handleCancelAdd} />
        <Dialog.Button label="Copy" onPress={handleAdd} />
      </Dialog.Container>
    </View>
  );
}
