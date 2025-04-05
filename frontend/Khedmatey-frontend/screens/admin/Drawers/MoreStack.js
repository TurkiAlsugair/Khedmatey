import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MoreScreen from "../MoreStack/MoreScreen";

const Stack = createStackNavigator();

export default function MoreStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="More"
        component={MoreScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
