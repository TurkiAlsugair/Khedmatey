import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "../DashboardStack/DashboardScreen";

const Stack = createStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      {/* Add more screens if needed */}
    </Stack.Navigator>
  );
}
