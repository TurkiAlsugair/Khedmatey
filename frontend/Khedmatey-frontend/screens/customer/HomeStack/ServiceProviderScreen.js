// screens/Customer/ServiceProviderScreen.js
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import axios from "axios";

import { Colors } from "../../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import CategoriesRow from "../../../components/CustomerHome/CategoriesRow";
import ServiceItem from "../../../components/CustomerHome/ServiceItem";
import { AuthContext } from "../../../context/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function ServiceProviderScreen({ navigation, route }) {
  const { token } = useContext(AuthContext);
  /* ─────────────────────── params & header title */
  const { provider } = route.params;
  const { id: providerId, username } = provider;

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: username || "Service Provider" });
  }, [navigation, username]);

  /* ─────────────────────── state */
  const [services, setServices] = useState([]); // flattened list
  const [filteredServices, setFilteredServices] = useState([]);
  const [providerCategories, setProviderCategories] = useState([
    { label: "All", value: "All" },
  ]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState("");

  /* ─────────────────────── fetch + reshape */
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setBackendError("");
      try {
        const res = await axios.get(`${API_BASE_URL}/service`, {
          params: {
            spId: providerId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const cats = res.data?.data?.data?.services || [];
        console.log("cats", cats);

        /* 1️⃣ flatten & rename id‑fields so the rest of the app doesn't change */
        const flat = [];
        cats.forEach((cat) => {
          cat.services.forEach((svc) => {
            flat.push({
              ...svc,
              categoryId: Number(cat.categoryId),
              category: { id: Number(cat.categoryId), name: cat.categoryName },
              serviceProvider: provider, // keep reference if needed
            });
          });
        });

        /* 2️⃣ prepare category chips for <CategoriesRow/> */
        const chips = [
          { label: "All", value: "All" },
          ...cats.map((c) => ({
            label: c.categoryName,
            value: String(c.categoryId), // Use categoryId instead of id
          })),
        ];

        setServices(flat);
        setFilteredServices(flat);
        setProviderCategories(chips);
      } catch (err) {
        console.error("Error fetching services:", err);
        setBackendError(
          err.response?.data?.message ||
            "Something went wrong fetching services."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [providerId]);

  /* ─────────────────────── filter whenever category changes */
  useEffect(() => {
    if (activeCategory === "All") {
      setFilteredServices(services);
    } else {
      const catIdNum = Number(activeCategory);
      setFilteredServices(
        services.filter((svc) => svc.categoryId === catIdNum)
      );
    }
  }, [activeCategory, services]);

  /* ─────────────────────── render guards */
  if (backendError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{backendError}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!services.length) {
    return (
      <View style={styles.empty}>
        <Text>No services found for {username}</Text>
      </View>
    );
  }

  /* ─────────────────────── UI */
  return (
    <View style={styles.container}>
      {/* simple provider header */}
      <View style={styles.infoCont}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>IMG</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.name}>{username}</Text>
          <Text style={styles.rating}>Rating: {provider.avgRating}</Text>
        </View>
      </View>

      <CategoriesRow
        categories={providerCategories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <FlatList
        data={filteredServices}
        keyExtractor={(item, index) => item.serviceId?.toString() || `service-${index}`}
        renderItem={({ item }) => (
          <ServiceItem service={item} showProvider={false} />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: hp(10) }}
      />
    </View>
  );
}

/* ─────────────────────── styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  /* provider info */
  infoCont: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    marginHorizontal: 16,
    marginTop: hp(3),
    padding: 20,
    gap: hp(3),
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: { color: "#fff", fontWeight: "bold" },
  infoSection: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 16, fontWeight: "bold", color: "#333" },
  rating: { marginTop: 4, color: Colors.secondary, fontSize: 13 },
  /* states */
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { color: "red", fontSize: 16, textAlign: "center" },
});
