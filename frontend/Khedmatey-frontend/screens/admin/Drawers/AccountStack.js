import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AccountsScreen from "../AccountsStack/AccountsScreen";

const Stack = createStackNavigator();

export default function AccountsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Accounts"
        component={AccountsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
