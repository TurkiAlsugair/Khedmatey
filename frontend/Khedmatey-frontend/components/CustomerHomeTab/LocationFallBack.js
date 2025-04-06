import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, Button, Linking, StyleSheet } from "react-native";

export default function LocationFallBack() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location is required</Text>
      <Text>Please enable location to continue</Text>
      <Button title="Enable Location" onPress={() => Linking.openSettings()} />
      <Button
        title="Choose from Map"
        onPress={() => navigation.navigate("PickFromMap")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
});
