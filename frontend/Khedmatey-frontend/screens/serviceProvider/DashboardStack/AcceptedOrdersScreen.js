// screens/serviceProvider/tabs/AcceptedOrdersScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Text,
} from "react-native";
import axios from "axios";
import { Colors } from "../../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import CitiesRow from "../../../components/Orders/SP-Orders/CitiesRow";
import OrderItem from "../../../components/Orders/SP-Orders/OrderItem";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function AcceptedOrdersScreen() {
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [citiesData, setCitiesData] = useState([]);
  const [activeCity, setActiveCity] = useState("All");

  useEffect(() => {
    fetchAcceptedRequests();
  }, []);

  const fetchAcceptedRequests = async () => {
    setLoading(true);
    try {
      // 1) Fetch from the "accepted" endpoint instead of "pending"
      const response = await axios.get(`${API_BASE_URL}/request/accepted`);
      // 2) Data shape is identical, just with "ACCEPTED" status
      const fetched = response.data?.data?.requests || [];
      setCitiesData(fetched);
      setBackendError("");
    } catch (err) {
      console.error("Failed to fetch accepted requests:", err);
      setBackendError(
        err.response?.data?.message || "Something went wrong fetching requests."
      );
    } finally {
      setLoading(false);
    }
  };

  const ddmmyyyyToDate = (str) => {
    const [dd, mm, yyyy] = str.split("/");
    return new Date(`${yyyy}-${mm}-${dd}`);
  };

  const getFilteredRequests = () => {
    if (activeCity === "All") {
      const combined = [];
      citiesData.forEach((c) => combined.push(...c.requests));

      combined.sort((a, b) => ddmmyyyyToDate(a.date) - ddmmyyyyToDate(b.date));

      return combined; // <— what FlatList will render
    }

    const cityObj = citiesData.find((c) => c.city === activeCity);
    return cityObj ? cityObj.requests : [];
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
        keyExtractor={(item) => item.reqId.toString()}
        contentContainerStyle={{ paddingBottom: hp(10), paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <OrderItem request={item} isAccepted={true} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No accepted requests found.</Text>
          </View>
        }
      />
    </View>
  );
}

// Same styling approach as PendingOrdersScreen
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
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    color: "red",
    fontSize: wp(4),
    textAlign: "center",
    fontWeight: "bold",
  },
  empty: {
    marginTop: 50,
    alignItems: "center",
  },
});
