import { createStackNavigator } from "@react-navigation/stack";
import ServiceProviderMainTabs from "./ServiceProviderMainTabs";
import CompanyAccount from "../../screens/serviceProvider/MoreStack/CompanyAccount";
import AboutKhedmateyScreen from "../../screens/serviceProvider/MoreStack/AboutKhedmateyScreen";
import PrivacyAndTermsScreen from "../../screens/serviceProvider/MoreStack/PrivacyAndTermsScreen";
import AddWorkerScreen from "../../screens/serviceProvider/WorkersStack/AddWorkerScreen";
import EditWorkerScreen from "../../screens/serviceProvider/WorkersStack/EditWorkerScreen";
import AddServiceScreen from "../../screens/serviceProvider/ServicesStack/AddServiceScreen";
import UpdateServiceScreen from "../../screens/serviceProvider/ServicesStack/UpdateServiceScreen";
import { ServicesProvider } from "../../context/ServicesContext";
import ManageScheduleScreen from "../../screens/serviceProvider/DashboardStack/ManageScheduleScreen";
import { Colors } from "../../constants/styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import OrderDetailsScreen from "../../screens/serviceProvider/DashboardStack/SP-OrderDetailsScreen";
import OrdersScreen from "../../screens/serviceProvider/DashboardStack/OrdersScreen";
import PreviousOrderScreen from "../../screens/serviceProvider/DashboardStack/PreviousOrderScreen";

const Stack = createStackNavigator();

export default function ServiceProviderNavigator() {
  const navigation = useNavigation();
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

        <Stack.Screen
          name="ManageSchedule"
          component={ManageScheduleScreen}
          // options={{ headerShown: false, animation: "fade" }}
          options={{
            title: "Manage Schedule",
            animation: "fade",
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "white",
            headerLeft: (props) => (
              <Ionicons
                name="arrow-back"
                size={24}
                color="white"
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
          }}
        />

        <Stack.Screen
          name="OrdersScreen"
          component={OrdersScreen}
          // options={{ headerShown: false, animation: "fade" }}
          options={{
            title: "Orders",
            animation: "fade",
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "white",
            headerLeft: (props) => (
              <Ionicons
                name="arrow-back"
                size={24}
                color="white"
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
          }}
        />
        
        <Stack.Screen
          name="OrderDetails"
          component={OrderDetailsScreen}
          // options={{ headerShown: false, animation: "fade" }}
          options={{
            title: "Order Details",
            // animation: "fade",
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "white",
            headerLeft: (props) => (
              <Ionicons
                name="arrow-back"
                size={24}
                color="white"
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
          }}
        />

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

        {/* Services Stacks */}
        <Stack.Screen
          name="Add Service"
          component={AddServiceScreen}
          options={({ navigation /*, route */ }) => ({
            title: "Add Service",
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
          name="Update Service"
          component={UpdateServiceScreen}
          options={({ navigation /*, route */ }) => ({
            title: "Update Service",
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

        {/* Workers Stacks */}
        <Stack.Screen
          name="Add Worker"
          component={AddWorkerScreen}
          options={({ navigation /*, route */ }) => ({
            title: "Add Worker",
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
          name="Edit Worker"
          component={EditWorkerScreen}
          options={{
            title: "Edit Worker",
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "#fff",
            headerLeft: (props) => (
              <Ionicons
                name="arrow-back"
                size={24}
                color="white"
                style={{ marginLeft: 15 }}
                onPress={() => navigation.goBack()}
              />
            ),
          }}
        />

        {/* More... Stack */}
        <Stack.Screen
          name="Company Account"
          component={CompanyAccount}
          options={({ navigation /*, route */ }) => ({
            title: "Company Account",
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
    </ServicesProvider>
  );
}
