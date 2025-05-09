import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet } from "react-native";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import HomeScreen from "../../screens/customer/tabs/HomeScreen";
import OrdersScreen from "../../screens/customer/tabs/OrdersScreen";
import MoreScreen from "../../screens/customer/tabs/MoreScreen";
import { Colors } from "../../constants/styles";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ReceiptsScreen from "../../screens/customer/tabs/ReceiptsScreen";

const Tab = createBottomTabNavigator();

export default function CustomerMainTabs() {
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
            elevation: 5, // Android shadow
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
          name="Home"
          component={HomeScreen}
          options={{
            // title: "Home",

            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={20}
                color={color}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Orders"
          component={OrdersScreen}
          options={{
            // title: "Orders",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "reader" : "reader-outline"}
                size={20}
                color={color}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Receipts"
          component={ReceiptsScreen}
          options={{
            // title: "Help",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "receipt" : "receipt-outline"}
                size={20}
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
