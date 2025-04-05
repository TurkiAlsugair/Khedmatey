import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ApprovalScreen from "../ApprovalStack/ApprovalScreen";
import PendingServicesScreen from "../ApprovalStack/PendingServicesScreen";

const Stack = createStackNavigator();

export default function ApprovalStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Approval"
        component={ApprovalScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PendingServices"
        component={PendingServicesScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
