import { Redirect } from "expo-router";
import React from "react";

const Index = () => {
  return <Redirect href="/(auth)/login" />;
};

export default Index;
