import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";

import { AuthContext } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import CustomerNavigator from "./customer/CustomerNavigator";
import ServiceProviderNavigator from "./serviceProvider/ServiceProviderNavigator";
import WorkerNavigator from "./WorkerNavigator";
import AdminNavigator from "./admin/AdminNavigator";
import SplashScreen from "../screens/SplashScreen";

export default function AppNavigator() {
  const { userRole, loading } = useContext(AuthContext);

  // Show while AsyncStorage loads
  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      {userRole === "customer" ? (
        <CustomerNavigator />
      ) : userRole === "serviceProvider" ? (
        <ServiceProviderNavigator />
      ) : userRole === "worker" ? (
        <WorkerNavigator />
      ) : userRole === "admin" ? (
        <AdminNavigator />
      ) : (
        // Default: Show login/signup
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
