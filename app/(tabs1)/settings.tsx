import Loading from "@/components/Loading";
import { api } from "@/convex/_generated/api";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { BlurView } from "expo-blur";
import { useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../../components/colors";

const Settings = () => {
  const { signOut } = useAuth();

  const { user } = useUser();

  const clerkId = user?.id as string;

  const fullUser = useQuery(
    api.users.getUserByClerk,
    clerkId ? { clerkId } : "skip"
  );

  const [username, setUsername] = useState(fullUser?.username);
  const [pickedColor, setPickedColor] = useState(fullUser?.color);
  const [text, setText] = useState("");

  useEffect(() => {
    setUsername(fullUser?.username);
    setPickedColor(fullUser?.color);
  }, [fullUser]);

  // reset color if not saved
  const segments = useSegments();
  useEffect(() => {
    if (pickedColor !== fullUser?.color) {
      setPickedColor(fullUser?.color);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  // show and hide log out

  // handle username change

  const changeUsername = useMutation(api.users.changeUsername);

  const handleUsernameSave = () => {
    if (text.length >= 2 && fullUser !== null && fullUser !== undefined) {
      changeUsername({
        id: fullUser._id,
        username: text,
      });
      setText("");
      Keyboard.dismiss();
    }
  };

  const changeColor = useMutation(api.users.changeColor);

  const [debouncedColor, setDebouncedColor] = useState(pickedColor);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedColor(pickedColor);
    }, 500);

    return () => clearTimeout(timer);
  }, [pickedColor]);

  useEffect(() => {
    if (
      debouncedColor !== fullUser?.color &&
      fullUser !== null &&
      fullUser !== undefined &&
      debouncedColor !== undefined
    ) {
      changeColor({
        id: fullUser._id,
        color: debouncedColor,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedColor, fullUser]);

  const [modalVisible, setModalVisible] = useState(false);

  if (fullUser === undefined) {
    return <Loading />;
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardDismissMode="on-drag"
    >
      <View>
        <View className="p-5">
          <View className="w-full flex flex-row items-center justify-between mb-10 mt-5">
            <Text className="text-xl font-bold">Welcome, {username} </Text>
            <View
              style={{ backgroundColor: pickedColor }}
              className="w-14 h-14 rounded-full flex items-center justify-center"
            >
              <Text className="text-white text-2xl font-bold">
                {fullUser?.username?.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          </View>

          <View className="flex flex-col items-center justify-center gap-10 w-full">
            {/**change username box */}
            <View className="felx flex-col items-start justify-center gap-3 w-full">
              <Text className="text-xl font-semibold">Change username: </Text>
              <View className="flex flex-row gap-2 w-full">
                <TextInput
                  className="p-5 border border-slate-600 rounded-lg w-[65%] "
                  placeholder="New username"
                  placeholderTextColor={"#475569"}
                  onChangeText={(newText) => setText(newText)}
                  defaultValue={text}
                />
                <TouchableOpacity
                  onPress={handleUsernameSave}
                  className="flex-1 rounded-lg bg-slate-800 p-5"
                >
                  <Text className="text-white font-bold text-xl text-center">
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/**change user color box */}
            <View className="felx flex-col items-start justify-center gap-3 w-full">
              <Text className="text-xl font-semibold">Change Color:</Text>

              <View className="flex flex-row flex-wrap justify-between w-full">
                {colors.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{ backgroundColor: color }}
                    onPress={() => setPickedColor(color)}
                    className={`w-[31%] h-16 mb-2 rounded-lg  ${
                      color === pickedColor
                        ? "border-4 border-blue-500"
                        : "border border-gray-300"
                    } `}
                  />
                ))}
              </View>
            </View>
          </View>

          {/**Danger zone */}
          <View className="mt-16 mb-4 flex flex-col items-center justify-center w-full">
            <View className=" w-full bg-red-600 h-1.5 rounded-t-lg" />
            <View className=" w-full bg-slate-800 h-1" />
            <View className=" w-full bg-red-600 h-1.5 rounded-b-lg" />

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="p-5 bg-red-600 rounded-lg w-full mt-5"
            >
              <Text className="text-center text-white font-bold text-xl ">
                Log Out
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
          <View className="w-[80%] -mt-[10%] bg-white rounded-xl p-5 ">
            <Text className="font-bold text-2xl text-center">Log Out?</Text>

            <Text className="text-center text-gray-500 text-lg mt-2">
              Are you sure you want to log out?
            </Text>

            <View className="flex flex-row w-full mt-10 gap-3">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="p-5 bg-slate-800 rounded-lg flex-1"
              >
                <Text className="text-center text-white font-bold text-xl ">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => signOut()}
                className="p-5 bg-red-600 rounded-lg flex-1"
              >
                <Text className="text-center text-white font-bold text-xl ">
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Settings;
