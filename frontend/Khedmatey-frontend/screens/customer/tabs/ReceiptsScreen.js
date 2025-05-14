import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import ReceiptList from "../../../components/Receipts/ReceiptsList";
import { Colors } from "../../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import FilterReceiptsModal from "../../../components/Modals/FilterReceiptsModal";
import { AuthContext } from "../../../context/AuthContext";
import { fetchAllOrders } from "../../../utility/order";

export default function ReceiptsScreen() {
  const insets = useSafeAreaInsets();
  const { token, userInfo } = useContext(AuthContext);
  
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    priceSort: 'default',
    statusFilter: 'default',
    dateSort: 'default'
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

  const fetchReceipts = useCallback(async (isRefresh = false) => {
    if (!token) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    setBackendError("");
    try {
      const data = await fetchAllOrders(token, "CUSTOMER", ["INVOICED", "PAID"]);
      const flattenedReceipts = flatten(data);
      setReceipts(flattenedReceipts);
      setFilteredReceipts(flattenedReceipts);
      applyFilters(flattenedReceipts);
    } catch (err) {
      setBackendError(err.response?.data?.message || "Something went wrong.");
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, [token]);

  // Apply filters whenever activeFilters change
  const applyFilters = useCallback((receiptsData = receipts) => {
    let results = [...receiptsData];
    const { priceSort, statusFilter, dateSort } = activeFilters;
    
    // Apply status filter
    if (statusFilter !== 'default') {
      results = results.filter(receipt => receipt.status === statusFilter);
    }
    
    // Apply price sorting
    if (priceSort !== 'default') {
      results.sort((a, b) => {
        const priceA = parseFloat(a.totalPrice);
        const priceB = parseFloat(b.totalPrice);
        return priceSort === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }
    
    // Apply date sorting
    if (dateSort !== 'default') {
      results.sort((a, b) => {
        // Convert DD/MM/YYYY to Date objects for comparison
        const datePartsA = a.date.split('/');
        const datePartsB = b.date.split('/');
        
        const dateA = new Date(
          parseInt(datePartsA[2]), 
          parseInt(datePartsA[1]) - 1, 
          parseInt(datePartsA[0])
        );
        
        const dateB = new Date(
          parseInt(datePartsB[2]), 
          parseInt(datePartsB[1]) - 1, 
          parseInt(datePartsB[0])
        );
        
        return dateSort === 'newest' 
          ? dateB - dateA // Newest first
          : dateA - dateB; // Oldest first
      });
    }
    
    setFilteredReceipts(results);
    
    // Check if any filters are not on default
    setIsFiltered(
      priceSort !== 'default' || 
      statusFilter !== 'default' || 
      dateSort !== 'default'
    );
  }, [activeFilters, receipts]);

  const handleFilterApply = (filters) => {
    setActiveFilters(filters);
    applyFilters();
  };
  
  const clearFilters = () => {
    setActiveFilters({
      priceSort: 'default',
      statusFilter: 'default',
      dateSort: 'default'
    });
    setIsFiltered(false);
    setFilteredReceipts(receipts);
  };

  // reload whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchReceipts();
    }, [fetchReceipts])
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
  if (backendError || receipts.length === 0) {
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
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Receipts</Text>
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

      {filteredReceipts.length === 0 && isFiltered ? (
        <View style={styles.emptyFilterContainer}>
          <Text style={styles.emptyFilterText}>No receipts match your filters.</Text>
          <TouchableOpacity 
            style={styles.resetFilterButton}
            onPress={clearFilters}
          >
            <Text style={styles.resetFilterText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ReceiptList
          data={filteredReceipts}
          refreshing={refreshing}
          onRefresh={() => fetchReceipts(true)}
        />
      )}

      <FilterReceiptsModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
        initialFilters={activeFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: "black",
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
    marginRight: 10,
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
