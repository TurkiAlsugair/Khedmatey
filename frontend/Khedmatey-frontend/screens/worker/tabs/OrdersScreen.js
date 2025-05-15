// screens/worker/OrdersScreen.js
import React, { useCallback, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../../constants/styles";

import OrdersList from "../../../components/Orders/W-Orders/OrdersList";
import { AuthContext } from "../../../context/AuthContext";
import { fetchAllOrders } from "../../../utility/order";


const GROUPS = {
  ASSIGNED: ["ACCEPTED", "PENDING"],
  CURRENT: ["COMING", "IN_PROGRESS"],
  PREVIOUS: ["INVOICED", "PAID"],
};

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();

  const { token, userRole } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("ASSIGNED");
  const [rawData, setRawData] = useState([]); // full response
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const res = await fetchAllOrders(token, "WORKER");
      setRawData(res);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, userRole]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  /* ───────── derived lists */
  const flatten = (statuses) =>
    rawData
      .filter((g) => statuses.includes(g.status))
      .flatMap((g) =>  g.requests.map((r) => ({ ...r, status: g.status }))
      );

  const dataMap = {
    ASSIGNED: flatten(GROUPS.ASSIGNED),
    CURRENT: flatten(GROUPS.CURRENT),
    PREVIOUS: flatten(GROUPS.PREVIOUS),
  };

  return (
    <View style={[styles.main, { paddingTop: insets.top + hp(1.5) }]}>
      <Text style={styles.title}>Orders</Text>

      {/* top tabs */}
      <View style={styles.tabsRow}>
        {Object.keys(GROUPS).map((k) => (
          <Text
            key={k}
            style={activeTab === k ? styles.activeTab : styles.tab}
            onPress={() => setActiveTab(k)}
          >
            {k.charAt(0) + k.slice(1).toLowerCase()}
          </Text>
        ))}
      </View>

      {/* body */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      ) : (
        <OrdersList
          listType={activeTab}
          data={dataMap[activeTab]}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  title: { fontSize: wp(7), fontWeight: "bold", marginBottom: hp(2) },

  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: hp(2),
  },
  tab: {
    color: "#fff",
    fontSize: wp(3.7),
    padding: 6,
  },
  activeTab: {
    color: "#fff",
    fontWeight: "700",
    backgroundColor: Colors.secondary,
    padding: 6,
    borderRadius: 8,
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
