import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Colors, ORDER_STATUS_STYLES } from "../../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const UnhandledRequestsScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [expandedCards, setExpandedCards] = useState({});
  const { token } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const fetchUnhandledRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/admin/requests/unhandled`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedRequests = response.data.data;
      setRequests(fetchedRequests);
      applyFilter(activeFilter, fetchedRequests);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch unhandled requests";
      setError(errorMsg);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMsg,
        visibilityTime: 2000,
        topOffset: hp(7),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (filter, requestsData = requests) => {
    // Update the active filter state
    setActiveFilter(filter);
    
    // Filter the requests based on the selected filter
    switch (filter) {
      case "PENDING":
        setFilteredRequests(requestsData.filter(request => request.status === "PENDING"));
        break;
      case "CANCELED":
        setFilteredRequests(requestsData.filter(request => request.status === "CANCELED"));
        break;
      default:
        setFilteredRequests(requestsData);
        break;
    }
  };

  useEffect(() => {
    fetchUnhandledRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUnhandledRequests();
  };

  // Format date from API format to readable format
  const formatDate = (dateString) => {
    return dateString || "N/A";
  };
  
  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Card for displaying request information
  const RequestCard = ({ item }) => {
    // Get the appropriate status style
    const statusStyle = ORDER_STATUS_STYLES[item.status] || ORDER_STATUS_STYLES.PENDING;
    const isExpanded = expandedCards[item.id] || false;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => toggleCardExpansion(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.serviceTitle}>
              Order #{item.id.substring(0, 7)}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyle.bg, color: statusStyle.text },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.cardBody}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Customer</Text>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color="#666" style={styles.infoIcon} />
                <Text style={styles.infoText}>{item.customer?.username || "N/A"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={16} color="#666" style={styles.infoIcon} />
                <Text style={styles.infoText}>{item.customer?.phoneNumber || "N/A"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color="#666" style={styles.infoIcon} />
                <Text style={styles.infoText}>{item.location?.miniAddress || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Service Provider</Text>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color="#666" style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  {item.serviceProvider?.username || "N/A"}
                  {item.serviceProvider?.usernameAR ? ` - ${item.serviceProvider.usernameAR}` : ""}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={16} color="#666" style={styles.infoIcon} />
                <Text style={styles.infoText}>{item.serviceProvider?.phoneNumber || "N/A"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={16} color="#666" style={styles.infoIcon} />
                <Text style={styles.infoText}>{item.serviceProvider?.email || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color="#666" style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{formatDate(item.date)}</Text>
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.cardFooter}>
          <Text style={styles.expandText}>
            {isExpanded ? "Hide Details" : "Show Details"}
          </Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#666" 
          />
        </View>
      </TouchableOpacity>
    );
  };

  // Filter buttons
  const FilterButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isActive && styles.activeFilterButton
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterButtonText,
        isActive && styles.activeFilterButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const getPendingCount = () => {
    return requests.filter(request => request.status === "PENDING").length;
  };

  const getCanceledCount = () => {
    return requests.filter(request => request.status === "CANCELED").length;
  };

  // Header component with filter buttons
  const HeaderComponent = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleRow}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>
          Dashboard
        </Text>
      </View>
      
      <View style={styles.filterContainer}>
        <FilterButton 
          title={`All (${requests.length})`} 
          isActive={activeFilter === "ALL"} 
          onPress={() => applyFilter("ALL")} 
        />
        <FilterButton 
          title={`Pending (${getPendingCount()})`} 
          isActive={activeFilter === "PENDING"} 
          onPress={() => applyFilter("PENDING")} 
        />
        <FilterButton 
          title={`Canceled (${getCanceledCount()})`} 
          isActive={activeFilter === "CANCELED"} 
          onPress={() => applyFilter("CANCELED")} 
        />
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading unhandled requests...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUnhandledRequests}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <RequestCard item={item} />}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + hp(2) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListHeaderComponent={<HeaderComponent />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={60} color="#999" />
            <Text style={styles.emptyText}>No unhandled requests found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: wp(4),
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: wp(4),
    color: "#e74c3c",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: wp(4),
  },
  headerContainer: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),

  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  screenTitle: {
    fontSize: wp(5.5),
    fontWeight: "bold",
    color: "#333",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    color: "#555",
    fontWeight: "600",
    fontSize: wp(3.5),
  },
  activeFilterButtonText: {
    color: "white",
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(10),
  },
  emptyText: {
    marginTop: 12,
    fontSize: wp(4),
    color: "#999",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  expandText: {
    fontSize: wp(3.5),
    color: "#666",
    marginRight: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 8,
  },
  serviceTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: wp(3),
    fontWeight: "600",
    overflow: "hidden",
    textAlign: "center",
  },
  cardBody: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: wp(4.2),
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
    width: 20,
    textAlign: "center",
  },
  infoText: {
    fontSize: wp(3.8),
    color: "#555",
  },
  infoLabel: {
    fontSize: wp(3.8),
    color: "#666",
    marginRight: 4,
  },
  infoValue: {
    fontSize: wp(3.8),
    color: "#333",
    fontWeight: "500",
  }
});

export default UnhandledRequestsScreen; 