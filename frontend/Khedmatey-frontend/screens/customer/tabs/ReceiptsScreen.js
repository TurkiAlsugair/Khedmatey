import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ReceiptList from "../../../components/Receipts/ReceiptsList";
import { Colors } from "../../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function ReceiptsScreen() {
  const insets = useSafeAreaInsets();
  const [grouped, setGrouped] = useState([]); // raw grouped by status
  const [flat, setFlat] = useState([]); // flattened array
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backendError, setBackendError] = useState("");

  const fetchReceipts = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setBackendError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/request/receipts`);
      const grp = res.data.data || [];
      setGrouped(grp);

      // flatten: attach status to each receipt
      const all = grp.reduce((acc, { status, requests }) => {
        const withStatus = requests.map((r) => ({ ...r, status }));
        return acc.concat(withStatus);
      }, []);
      setFlat(all);
    } catch (err) {
      setBackendError(err.response?.data?.message || "Something went wrong.");
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  // first‐load spinner
  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // error or empty states use a ScrollView to enable pull‑to‑refresh
  if (backendError || flat.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.center,
          { paddingTop: insets.top, flexGrow: 1 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchReceipts(true)}
          />
        }
      >
        {backendError ? (
          <Text style={styles.errorText}>{backendError}</Text>
        ) : (
          <Text style={styles.emptyText}>You have no receipts.</Text>
        )}
      </ScrollView>
    );
  }

  // normal data state
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Receipts</Text>
      <ReceiptList
        data={flat}
        refreshing={refreshing}
        onRefresh={() => fetchReceipts(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    fontSize: wp(6),
    fontWeight: "bold",
    padding: 16,
    color: "black",
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
