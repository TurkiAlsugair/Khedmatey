// stacks/DashboardStack.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ComplaintsScreen from "../ComplaintsStack/ComplaintsScreen";

const Stack = createStackNavigator();

export default function ComplaintsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Complaints"
        component={ComplaintsScreen}
        options={{ headerShown: false }}
      />
      {/* Add more screens if needed */}
    </Stack.Navigator>
  );
}
