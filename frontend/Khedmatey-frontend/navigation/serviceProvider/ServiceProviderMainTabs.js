import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { Colors } from "../../constants/styles";
import DashboardScreen from "../../screens/serviceProvider/tabs/DashboardScreen";
import ServicesScreen from "../../screens/serviceProvider/tabs/ServicesScreen";
import WorkersScreen from "../../screens/serviceProvider/tabs/WorkersScreen";
import MoreScreen from "../../screens/serviceProvider/tabs/MoreScreen";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

export default function ServiceProviderMainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: Colors.secondary,
          // tabBarInactiveTintColor: "#aaa",
          tabBarStyle: {
            position: "absolute",
            bottom: insets.bottom,
            marginLeft: 20,
            marginRight: 20,
            height: 60,
            borderRadius: 20,
            borderTopWidth: 0, // to remove default tob border
            backgroundColor: "white",
            // paddingBottom: Platform.OS === "ios" ? 10 : 5,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            // title: "Dashboard",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "albums" : "albums-outline"}
                size={20}
                color={color}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Services"
          component={ServicesScreen}
          options={{
            // title: "Services",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "construct" : "construct-outline"}
                size={20}
                color={color}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Workers"
          component={WorkersScreen}
          options={{
            // title: "Workers",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "body" : "body-outline"}
                size={25}
                color={color}
              />
            ),
          }}
        />

        <Tab.Screen
          name="More"
          component={MoreScreen}
          options={{
            // title: "More",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={
                  focused
                    ? "ellipsis-horizontal"
                    : "ellipsis-horizontal-outline"
                }
                size={30}
                color={color}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

// Styles for the View that wrapes all screens
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: Platform.OS === "android" ? hp(2.5) : 0,
    backgroundColor: Colors.background,
  },
});
