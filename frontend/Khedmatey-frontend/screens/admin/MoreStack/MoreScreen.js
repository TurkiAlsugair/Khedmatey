// AdminDashboardScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Text>More screen</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
