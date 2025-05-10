// screens/serviceProvider/tabs/AcceptedOrdersScreen.js
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Text,
} from "react-native";
import axios from "axios";
import { Colors, ORDER_STATUS_STYLES } from "../../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AuthContext } from "../../../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

import CitiesRow from "../../../components/Orders/SP-Orders/CitiesRow";
import OrderItem from "../../../components/Orders/SP-Orders/OrderItem";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function OrdersScreen({ route, navigation }) {
  const { status } = route.params;
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [citiesData, setCitiesData] = useState([]);
  const [activeCity, setActiveCity] = useState("All");

  useEffect(() => {
    // Set screen title based on status
    navigation.setOptions({
      title: `${status.charAt(0) + status.slice(1).toLowerCase()} Orders`
    });
  }, [status, navigation]);

  // Fetch orders whenever the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
      return () => {
        // Cleanup if needed
      };
    }, [status, token])
  );

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/requests?status=${status}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const fetched = response.data?.data?.requests || [];
      setCitiesData(fetched);
      setBackendError("");
    } catch (err) {
      console.error(`Failed to fetch ${status} orders:`, err);
      setBackendError(
        err.response?.data?.message || `Something went wrong fetching ${status} orders.`
      );
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    if (activeCity === "All") {
      // Flatten the nested structure for "All" cities
      const combined = [];
      citiesData.forEach(cityGroup => {
        if (cityGroup.requests && Array.isArray(cityGroup.requests)) {
          combined.push(...cityGroup.requests);
        }
      });
      
      // Sort by ID for now (could be changed to date if needed)
      combined.sort((a, b) => a.id - b.id);
      return combined;
    }
    
    // Find the city group and return its requests
    const cityGroup = citiesData.find(group => group.city === activeCity);
    return cityGroup && cityGroup.requests ? cityGroup.requests : [];
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (backendError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{backendError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CitiesRow
        data={citiesData}
        activeCity={activeCity}
        setActiveCity={setActiveCity}
      />

      <FlatList
        data={getFilteredRequests()}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: hp(10), paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <OrderItem request={item} status={status} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No {status.toLowerCase()} orders found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: wp(4),
    textAlign: "center",
  },
  empty: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
