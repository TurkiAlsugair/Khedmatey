import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import CustomerMainTabs from "./CustomerMainTabs";
import MyAccountScreen from "../../screens/customer/MoreStack/MyAccountScreen";
import AboutKhedmateyScreen from "../../screens/customer/MoreStack/AboutKhedmateyScreen";
import PrivacyAndTermsScreen from "../../screens/customer/MoreStack/PrivacyAndTermsScreen";
import { LocationProvider } from "../../context/LocationContext";
import PickFromMap from "../../screens/customer/HomeStack/PickFromMap";
import SearchScreen from "../../screens/customer/HomeStack/SearchScreen";
import ServiceProviderScreen from "../../screens/customer/HomeStack/ServiceProviderScreen";
import { Colors } from "../../constants/styles";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PickAppointment from "../../screens/customer/HomeStack/PickAppointment";
import CheckoutScreen from "../../screens/customer/HomeStack/CheckoutScreen";
import OrderDetailsScreen from "../../screens/customer/OrdersStack/C-OrderDetailsScreen";
import PreviousOrderScreen from "../../screens/customer/ReceiptsStack/PreviousOrderScreen";
import PickAppointmentFUS from "../../screens/customer/OrdersStack/PickAppointmentFUS";
import CheckoutScreenFUS from "../../screens/customer/OrdersStack/CheckoutScreenFUS";

const Stack = createStackNavigator();

export default function CustomerNavigation() {
  const navigation = useNavigation();
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
          options={({ navigation /*, route */ }) => ({
            title: "Choose Location",
            // presentation: "modal",
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",

            headerLeft: (headerProps) => (
              <Ionicons
                name={"arrow-back"}
                size={24}
                color={"white"}
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
          })}
        />

        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ headerShown: false, animation: "fade" }}
        />

        <Stack.Screen
          name="ServiceProvider"
          component={ServiceProviderScreen}
          // options={{ headerShown: false, animation: "fade" }}
          options={({ navigation /*, route */ }) => ({
            // title: "",
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",

            headerLeft: (headerProps) => (
              <Ionicons
                name={"arrow-back"}
                size={24}
                color={"white"}
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
          })}
        />

        <Stack.Screen
          name="PickAppointment"
          component={PickAppointment}
          options={({ navigation /*, route */ }) => ({
            title: "Appointment Pick",
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",

            headerLeft: (headerProps) => (
              <Ionicons
                name={"arrow-back"}
                size={24}
                color={"white"}
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
          })}
        />

        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          // options={{ headerShown: false, animation: "fade" }}
          options={({ navigation /*, route */ }) => ({
            title: "Order Checkout",

            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",

            headerLeft: (headerProps) => (
              <Ionicons
                name={"arrow-back"}
                size={24}
                color={"white"}
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
          })}
        />

        {/* Orders Stacks */}
        <Stack.Screen
          name="Order Details"
          component={OrderDetailsScreen}
          options={({ navigation /*, route */ }) => ({
            title: "Order Details",

            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",

            headerLeft: (headerProps) => (
              <Ionicons
                name={"arrow-back"}
                size={24}
                color={"white"}
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
          })}
        />
       
        <Stack.Screen
          name="PickAppointmentFUS"
          component={PickAppointmentFUS}
          options={({ navigation /*, route */ }) => ({
            title: "Pick Appointment",

            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",

            headerLeft: (headerProps) => (
              <Ionicons
                name={"arrow-back"}
                size={24}
                color={"white"}
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
          })}
        />

        <Stack.Screen
          name="CheckoutScreenFUS"
          component={CheckoutScreenFUS}
         options={({ navigation /*, route */ }) => ({
            title: "Checkout",

            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",
            headerLeft: (headerProps) => (
              <Ionicons
                name={"arrow-back"}
                size={24}
                color={"white"}
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
            
         })}
        />
        {/* Receipts Stacks */}
        <Stack.Screen
          name="PreviousOrders"
          component={PreviousOrderScreen}
         options={({ navigation /*, route */ }) => ({
            title: "Previous Orders",

            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",
            headerLeft: (headerProps) => (
              <Ionicons
                name={"arrow-back"}
                size={24}
                color={"white"}
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
            
         })}
        />

        {/* More... Stack */}
        <Stack.Screen
          name="My Account"
          component={MyAccountScreen}
          options={({ navigation /*, route */ }) => ({
            title: "My Account",
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",

            headerLeft: (headerProps) => (
              <Ionicons
                name={"arrow-back"}
                size={24}
                color={"white"}
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
          })}
        />

          <Stack.Screen
          name="About Khedmatey"
          component={AboutKhedmateyScreen}
          options={({ navigation /*, route */ }) => ({
            title: "About Khedmatey",
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",
            headerLeft: (headerProps) => (
              <Ionicons
                name={"arrow-back"}
                size={24}
                color={"white"}
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
          })}
        />

          <Stack.Screen
          name="Privacy & Terms"
          component={PrivacyAndTermsScreen}
          options={({ navigation /*, route */ }) => ({
            title: "Privacy & Terms",
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",
            headerLeft: (headerProps) => (
              <Ionicons
                name={"arrow-back"}
                size={24}
                color={"white"}
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
          })}
        />

      </Stack.Navigator>
    </LocationProvider>
  );
}

