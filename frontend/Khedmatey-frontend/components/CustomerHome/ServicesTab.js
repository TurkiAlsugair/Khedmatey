// components/ServicesTab.js
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import axios from "axios";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import CategoriesRow from "./CategoriesRow";
import ServiceItem from "./ServiceItem";
import { serviceCategories } from "../../constants/data";
import { AuthContext } from "../../context/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const Categories = [{ label: "All", value: "All" }, ...serviceCategories];

export default function ServicesTab({ city }) {
  const { token } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch services when city changes or on mount
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/service?city=${city}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // The array of services is in response.data.data
        setServices(response.data.data);
        setFilteredServices(response.data.data); // default shows all
      } catch (error) {
        setBackendError(
          error.response?.data?.message || "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [city]);

  // Filter whenever activeCategory changes
  useEffect(() => {
    if (activeCategory === "All") {
      setFilteredServices(services);
    } else {
      // Convert to number if your categoryId is numeric
      const catId = parseInt(activeCategory, 10);
      const newList = services.filter((svc) => svc.categoryId === catId);
      setFilteredServices(newList);
    }
  }, [activeCategory, services]);

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

  return (
    <View style={styles.container}>
      {/* Horizontal categories row */}
      <CategoriesRow
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={Categories}
      />

      {/* The list of services */}
      {filteredServices.length === 0 ? (
        <View style={styles.empty}>
          <Text>No services found in {city}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ServiceItem service={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: hp(16) }}
        />
      )}
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
