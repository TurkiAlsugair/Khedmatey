import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "../DashboardStack/DashboardScreen";
import UnhandledRequestsScreen from "../DashboardStack/UnhandledRequestsScreen";

const Stack = createStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UnhandledRequests"
        component={UnhandledRequestsScreen}
        options={{ headerShown: false }}
      />
      {/* Add more screens if needed */}
    </Stack.Navigator>
  );
}
