import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../constants/styles";

import DashboardStack from "../../screens/admin/Drawers/DashboardStack";
import ApprovalStack from "../../screens/admin/Drawers/ApprovalStack";
import ComplaintsStack from "../../screens/admin/Drawers/ComplaintsStack";
import AccountsStack from "../../screens/admin/Drawers/AccountStack";
import CommunicationStack from "../../screens/admin/Drawers/CommunicationStack";
import MoreStack from "../../screens/admin/Drawers/MoreStack";

const Drawer = createDrawerNavigator();

export default function AdminNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ navigation }) => ({
        headerLeft: () => (
          <Ionicons
            name="menu"
            size={wp(6)}
            color={Colors.primary}
            style={{ marginLeft: wp(5) }}
            onPress={() => navigation.toggleDrawer()}
          />
        ),
        drawerActiveTintColor: "white", // color for active icon & label
        drawerInactiveTintColor: "rgba(255, 255, 255, 0.56)", // color for inactive icon & label
        drawerActiveBackgroundColor: "rgba(30, 114, 133, 0.68)", // background for active item
        drawerLabelStyle: {
          fontSize: wp(4),
        },
        drawerStyle: {
          backgroundColor: Colors.primary,
          width: '50%',
        },
        overlayColor: "rgba(124, 124, 124, 0.56)",
        drawerType: "front",
        // headerTitleAlign: "center",
      })}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          drawerLabel: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={wp(6)} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Approval"
        component={ApprovalStack}
        options={{
          drawerLabel: "Approval",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="checkmark-done-outline"
              size={wp(6)}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Customer Complaints"
        component={ComplaintsStack}
        options={{
          drawerLabel: "Complaints",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="warning-outline" size={wp(6)} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Accounts"
        component={AccountsStack}
        options={{
          drawerLabel: "Accounts",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={wp(6)} color={color} />
          ),
        }}
      />

      {/* <Drawer.Screen
        name="Communication"
        component={CommunicationStack}
        options={{
          drawerLabel: "Communication",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={wp(6)}
              color={color}
            />
          ),
        }}
      /> */}

      <Drawer.Screen
        name="More"
        component={MoreStack}
        options={{
          drawerLabel: "More",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="ellipsis-horizontal-circle-outline"
              size={wp(6)}
              color={color}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
