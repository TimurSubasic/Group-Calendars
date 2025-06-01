import { useSSO } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const Login = () => {
  const { startSSOFlow } = useSSO();

  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace("/(tabs1)");
      }
    } catch (error) {
      console.log("Error GoogleOAuth: ", error);
    }
  };

  return (
    <View className="flex-1 flex-col items-center justify-around m-5">
      <View className="flex flex-col items-center justify-center w-full gap-2">
        <Text className="text-4xl font-bold text-slate-800">
          Welcome to Group Calendars
        </Text>
        <Text className="text-lg font-semibold text-slate-600">
          The best way to manage your group calendars
        </Text>
      </View>

      <Image
        style={{
          height: 200,
          width: 200,
          borderRadius: 40,
        }}
        source={require("../../assets/images/new-icon.png")}
      />
      <TouchableOpacity
        onPress={() => handleGoogleSignIn()}
        className="p-5 rounded-lg bg-slate-800 shadow-xl flex flex-row gap-2 items-center justify-around w-[80%] m-5"
      >
        <Text className="text-2xl text-center font-bold text-white">
          Login via Google
        </Text>
        <View className="bg-white bg-blue- relative rounded-xl size-16 flex items-center justify-center">
          <FontAwesome name="google-plus-square" size={55} color="#2563eb" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
