import { createStackNavigator } from "@react-navigation/stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import LoginScreen from "../screens/auth/LoginScreen";
import SignupCustomerScreen from "../screens/auth/SignupCustomerScreen";
import SignupServiceProviderScreen from "../screens/auth/SignupServiceProvider";
import { SafeAreaView, StyleSheet, Platform } from "react-native";

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignupCustomer" component={SignupCustomerScreen} />
        <Stack.Screen
          name="SignupServiceProvider"
          component={SignupServiceProviderScreen}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
}

// Styles for the View that wrapes all screens
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === "android" ? hp(2.5) : 0,
  },
});
