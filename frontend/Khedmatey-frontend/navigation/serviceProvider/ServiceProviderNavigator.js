import { createStackNavigator } from "@react-navigation/stack";
import ServiceProviderMainTabs from "./ServiceProviderMainTabs";
import CompanyAccount from "../../screens/serviceProvider/MoreStack/CompanyAccount";
import AddWorkerScreen from "../../screens/serviceProvider/WorkersStack/AddWorkerScreen";
import AddServiceScreen from "../../screens/serviceProvider/ServicesStack/AddServiceScreen";
import UpdateServiceScreen from "../../screens/serviceProvider/ServicesStack/UpdateServiceScreen";
import { ServicesProvider } from "../../context/ServicesContext";

const Stack = createStackNavigator();

export default function ServiceProviderNavigator() {
  return (
    <ServicesProvider>
      <Stack.Navigator
        screenOptions={
          {
            // animation: "fade",
          }
        }
      >
        {/* 🟢 Tabs visible on this screen only */}
        <Stack.Screen
          name="ServiceProviderMainTabs"
          component={ServiceProviderMainTabs}
          options={{ headerShown: false }}
        />

        {/* 🔴 Stack-only screens (the stacks for each tab screen) */}

        {/* Dashboard Stacks */}

        {/* Services Stacks */}
        <Stack.Screen
          name="Add Service"
          component={AddServiceScreen}
          // options={{ title: "" }}
        />

        <Stack.Screen
          name="Update Service"
          component={UpdateServiceScreen}
          // options={{ title: "" }}
        />

        {/* Workers Stacks */}
        <Stack.Screen
          name="Add Worker"
          component={AddWorkerScreen}
          // options={{ title: "" }}
        />

        {/* More... Stack */}
        <Stack.Screen
          name="Company Account"
          component={CompanyAccount}
          // options={{ title: "" }}
        />
      </Stack.Navigator>
    </ServicesProvider>
  );
}
