import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CommunicationScreen from "../CommunicationStack/CommunicationScreen";

const Stack = createStackNavigator();

export default function CommunicationStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Communication"
        component={CommunicationScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
