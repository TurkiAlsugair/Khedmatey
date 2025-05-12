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
  TouchableOpacity
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../../../context/AuthContext";
import { fetchAllOrders } from "../../../utility/order";
import OrderList from "../../../components/Orders/C-Orders/OrderList";
import { Colors } from "../../../constants/styles";
import FilterCustomerOrdersModal from "../../../components/Modals/FilterCustomerOrdersModal";

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { token, userInfo } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    statusFilter: 'default'
  });
  const [isFiltered, setIsFiltered] = useState(false);

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
        const data = await fetchAllOrders(token, "CUSTOMER");
        const flattenedOrders = flatten(data);
        setOrders(flattenedOrders);
        setFilteredOrders(flattenedOrders);
        applyFilters(flattenedOrders);
      } catch (err) {
        setBackendError(err.response?.data?.message || "Something went wrong.");
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [token, userInfo.role, activeFilters]
  );

  // Apply filters whenever activeFilters change
  const applyFilters = useCallback((ordersData = orders) => {
    let results = [...ordersData];
    const { statusFilter } = activeFilters;
    
    // Apply status filter if not default
    if (statusFilter !== 'default') {
      results = results.filter(order => order.status === statusFilter);
    }
    
    setFilteredOrders(results);
    
    // Check if any filter is active
    setIsFiltered(statusFilter !== 'default');
  }, [activeFilters, orders]);

  // Handle filter application from modal
  const handleFilterApply = (filters) => {
    setActiveFilters(filters);
    applyFilters();
  };
  
  // Reset all filters
  const clearFilters = () => {
    setActiveFilters({
      statusFilter: 'default'
    });
    setIsFiltered(false);
    setFilteredOrders(orders);
  };

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
        <View style={styles.headerContainer}>
        <Text style={styles.header}>Orders</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons name="filter" size={22} color={Colors.primary} />
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
            {isFiltered && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {filteredOrders.length === 0 && isFiltered ? (
          <View style={styles.emptyFilterContainer}>
            <Text style={styles.emptyFilterText}>No orders match your filter.</Text>
            <TouchableOpacity 
              style={styles.resetFilterButton}
              onPress={clearFilters}
            >
              <Text style={styles.resetFilterText}>Reset Filter</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <OrderList
            data={filteredOrders}
          refreshing={refreshing}
          onRefresh={() => load(true)}
          />
        )}
        
        <FilterCustomerOrdersModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={handleFilterApply}
          initialFilters={activeFilters}
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
  headerContainer: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginTop: 8,
  },
  header: {
    fontSize: wp(6),
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
    marginBottom: 4,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterButtonText: {
    marginLeft: 4,
    color: Colors.primary,
    fontWeight: "500",
  },
  clearFiltersButton: {
    marginLeft: 10,
    padding: 6,
  },
  clearFiltersText: {
    color: "#888",
    textDecorationLine: "underline",
  },
  emptyFilterContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyFilterText: {
    fontSize: wp(4),
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  resetFilterButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetFilterText: {
    color: "white",
    fontWeight: "bold",
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
