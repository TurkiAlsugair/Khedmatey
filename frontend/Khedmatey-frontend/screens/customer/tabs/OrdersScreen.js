import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function OrdersScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Orders Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
