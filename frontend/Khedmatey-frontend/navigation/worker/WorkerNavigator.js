import { createStackNavigator } from "@react-navigation/stack";

import { Colors } from "../../constants/styles";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import WorkerAccount from "../../screens/worker/MoreStack/WorkerAccount";
import AboutKhedmateyScreen from "../../screens/worker/MoreStack/AboutKhedmateyScreen";
import PrivacyAndTermsScreen from "../../screens/worker/MoreStack/PrivacyAndTermsScreen";
import WorkerMainTabs from "./WorkerMainTabs";
import OrderDetailsScreen from "../../screens/worker/OrdersStack/W-OrderDetailsScreen";
import SendFollowUpServiceScreen from "../../screens/worker/OrdersStack/SendFollowUpServiceScreen";
import PreviousOrderScreen from "../../screens/worker/OrdersStack/PreviousOrderScreen";

const Stack = createStackNavigator();

export default function WorkerNavigator() {
  const navigation = useNavigation();
  return (
    <Stack.Navigator
      screenOptions={
        {
          // animation: "fade",
        }
      }
    >
      {/* 🟢 Tabs visible on this screen only */}
      <Stack.Screen
        name="WorkerMainTabs"
        component={WorkerMainTabs}
        options={{ headerShown: false }}
      />

      {/* 🔴 Stack-only screens (the stacks for each tab screen) */}

      {/* Home Stacks */}

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
        name="Follow-Up Service"
        component={SendFollowUpServiceScreen}
        options={({ navigation /*, route */ }) => ({
          title: "Follow-Up Service",
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
        name="Previous Order"
        component={PreviousOrderScreen}
        options={({ navigation /*, route */ }) => ({
          title: "Previous Order",
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
        name="Worker Account"
        component={WorkerAccount}
        options={({ navigation /*, route */ }) => ({
          title: "Worker Account",

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
  );
}
