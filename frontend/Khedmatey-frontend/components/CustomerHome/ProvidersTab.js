import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import axios from "axios";
import ProviderItem from "./ProviderItem";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function ProvidersTab({ city }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState("");

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        // GET /service-provider?city=...
        const response = await axios.get(
          `${API_BASE_URL}/service-provider?city=${city}`
        );
        // Assuming response.data.data is an array of providers
        setProviders(response.data.data);
      } catch (error) {
        setBackendError(
          error.response?.data?.message || "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [city]);

  if (backendError) {
    return (
      <View style={styles.empty}>
        <Text>{backendError}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!providers || !providers.length) {
    return (
      <View style={styles.empty}>
        <Text>No service providers found for {city}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={providers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProviderItem provider={item} />}
        contentContainerStyle={{ paddingBottom: hp(16) }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    marginTop: 50,
    alignItems: "center",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    marginTop: hp(16),
  },
});
