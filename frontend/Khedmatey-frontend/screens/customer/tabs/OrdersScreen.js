// screens/customer/OrdersScreen.js
import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { AuthContext } from "../../../context/AuthContext";
import { fetchAllOrders } from "../../../utility/order";
import OrderList from "../../../components/Orders/C-Orders/OrderList";
import { Colors } from "../../../constants/styles";

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { token, userInfo } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backendError, setBackendError] = useState("");

  // flatten grouped response into a single array
  const flatten = (groups = []) =>
    groups.flatMap((grp) =>
      (grp.requests || []).map((req) => ({
        ...req,
        status: grp.status,
      }))
    );

  const load = useCallback(
    async (isRefresh = false) => {
      if (!token) return;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setBackendError("");
      try {
        const data = await fetchAllOrders(token, "customer");
        setOrders(flatten(data));
      } catch (err) {
        setBackendError(err.response?.data?.message || "Something went wrong.");
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [token, userInfo.userRole]
  );

  // reload whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // first‐load spinner
  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // error or empty states use a ScrollView to enable pull‑to‑refresh
  if (backendError || orders.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.center,
          { paddingTop: insets.top, flexGrow: 1 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
          />
        }
      >
        {backendError ? (
          <Text style={styles.errorText}>{backendError}</Text>
        ) : (
          <Text style={styles.emptyText}>You have no orders.</Text>
        )}
      </ScrollView>
    );
  }

  return (
    <>
      <StatusBar barStyle={"dark-content"} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.header}>Orders</Text>
        <OrderList
          data={orders}
          refreshing={refreshing}
          onRefresh={() => load(true)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    fontSize: wp(6),
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginTop: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    color: "#555",
    fontSize: 16,
  },
});
