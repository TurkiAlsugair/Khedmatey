import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AccountsScreen from "../AccountsStack/AccountsScreen";
import CustomerDetailsScreen from "../AccountsStack/CustomerDetailsScreen";
import ServiceProviderDetailsScreen from "../AccountsStack/ServiceProviderDetailsScreen";
import CustomersBlacklistScreen from "../AccountsStack/CustomersBlacklistScreen";
import ServiceProvidersBlacklistScreen from "../AccountsStack/ServiceProvidersBlacklistScreen";

const Stack = createStackNavigator();

export default function AccountsStack() {
  return (
    <Stack.Navigator>

      <Stack.Screen
        name="Accounts"
        component={AccountsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CustomerDetails"
        component={CustomerDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ServiceProviderDetails"
        component={ServiceProviderDetailsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CustomersBlacklist"
        component={CustomersBlacklistScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ServiceProvidersBlacklist"
        component={ServiceProvidersBlacklistScreen}
        options={{ headerShown: false }}
      />


    </Stack.Navigator>
  );
}
