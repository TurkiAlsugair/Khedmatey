import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MoreScreen from "../MoreStack/MoreScreen";
import AboutKhedmateyScreen from "../MoreStack/AboutKhedmateyScreen";
import PrivacyAndTermsScreen from "../MoreStack/PrivacyAndTermsScreen";
import MyAccountScreen from "../MoreStack/MyAccountScreen";
import { Colors } from "../../../constants/styles";
import { Ionicons } from "@expo/vector-icons";

const Stack = createStackNavigator();

export default function MoreStack() {
  return (
    <Stack.Navigator>
       {/* More... Stack */}
       <Stack.Screen
          name="More Screen"
          component={MoreScreen}
          options={{headerShown: false}}
        />

       <Stack.Screen
          name="My Account"
          component={MyAccountScreen}
          options={{headerShown: false}}

        />

          <Stack.Screen
          name="About Khedmatey"
          component={AboutKhedmateyScreen}
          options={{headerShown: false}}

        />

          <Stack.Screen
          name="Privacy & Terms"
          component={PrivacyAndTermsScreen}
          options={{headerShown: false}}

        />
    </Stack.Navigator>
  );
}
