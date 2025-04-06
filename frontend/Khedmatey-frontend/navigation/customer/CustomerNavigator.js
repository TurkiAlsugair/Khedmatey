import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import CustomerMainTabs from "./CustomerMainTabs";
import MyAccountScreen from "../../screens/customer/MoreStack/MyAccountScreen";
import { LocationProvider } from "../../context/LocationContext";
import PickFromMap from "../../screens/customer/HomeStack/PickFromMap";

const Stack = createStackNavigator();

export default function CustomerNavigation() {
  return (
    <LocationProvider>
      <Stack.Navigator
        screenOptions={
          {
            // animation: "fade",
          }
        }
      >
        {/* 🟢 Tabs visible on this screen only */}
        <Stack.Screen
          name="CustomerMainTabs"
          component={CustomerMainTabs}
          options={{ headerShown: false }}
        />

        {/* 🔴 Stack-only screens (the stacks for each tab screen) */}

        {/* Home Stacks */}

        <Stack.Screen
          name="PickFromMap"
          component={PickFromMap}
          options={{ title: "Choose Location" }}
        />

        {/* Orders Stacks */}

        {/* Help Stacks */}

        {/* More... Stack */}
        <Stack.Screen
          name="My Account"
          component={MyAccountScreen}
          // options={{ title: "" }}
        />
      </Stack.Navigator>
    </LocationProvider>
  );
}
