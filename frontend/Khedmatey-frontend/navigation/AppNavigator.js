import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";

import { AuthContext } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import CustomerNavigator from "./customer/CustomerNavigator";
import ServiceProviderNavigator from "./serviceProvider/ServiceProviderNavigator";
import WorkerNavigator from "./worker/WorkerNavigator";
import AdminNavigator from "./admin/AdminNavigator";
import SplashScreen from "../screens/SplashScreen";
import i18n from "../locales/i18n";

export default function AppNavigator() {
  const { userRole, loading } = useContext(AuthContext);
  const isArabic = i18n.language === "ar";

  // Show while AsyncStorage loads
  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      {userRole === "CUSTOMER" ? (
        <CustomerNavigator isArabic={isArabic} />
      ) : userRole === "SERVICE_PROVIDER" ? (
        <ServiceProviderNavigator isArabic={isArabic} />
      ) : userRole === "WORKER" ? (
        <WorkerNavigator isArabic={isArabic} />
      ) : userRole === "ADMIN" ? (
        <AdminNavigator isArabic={isArabic} />
      ) : (
        // Default: Show login/signup
        <AuthNavigator isArabic={isArabic} />
      )}
    </NavigationContainer>
  );
}
