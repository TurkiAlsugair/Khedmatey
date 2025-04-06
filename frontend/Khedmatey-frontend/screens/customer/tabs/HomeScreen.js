import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
} from "react-native";
import { LocationContext } from "../../../context/LocationContext";
import useFetchLocation from "../../../hooks/FetchLocation";
import LocationFallBack from "../../../components/CustomerHomeTab/LocationFallBack";

export default function HomeScreen({ navigation }) {
  const { location, setLocation, locationLoading } =
    useContext(LocationContext);
  const [loading, setLoading] = useState(true);

  const supportedCities = ["Riyadh", "Jeddah", "Dammam", "Unayzah"];

  useFetchLocation({
    location,
    setLocation,
    setLoading,
    supportedCities,
    locationLoading,
  });

  if (locationLoading || loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!location) {
    return <LocationFallBack />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.info}>City: {location.city}</Text>
      <Text style={styles.info}>Address: {location.address}</Text>
      <Button
        title="Change Location"
        onPress={() => navigation.navigate("PickFromMap")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  info: { fontSize: 16, marginBottom: 5 },
});
