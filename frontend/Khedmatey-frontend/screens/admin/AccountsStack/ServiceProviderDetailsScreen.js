import React, { useContext, useState } from "react";
import { 
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal 
} from "react-native";
import { Colors, ORDER_STATUS_STYLES } from "../../../constants/styles";
import Button from "../../../components/UI/Button";
import axios from "axios";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import ServiceProviderCard from "./components/ServiceProviderCard";
import OrderItem from "./components/OrderItem";
import CustomerOrdersFilter from "./components/CustomerOrdersFilter";
import LoadingOverlay from "../../../components/LoadingOverlay";
import Price from "../../../components/UI/Price";
import { getCategoryNameById } from "../../../utility/services";
import { AuthContext } from "../../../context/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const ServicesList = ({ services }) => {
  if (!services || services.length === 0) {
    return (
      <Text style={styles.noDataText}>No services found for this provider</Text>
    );
  }

  return (
    <View style={styles.listContainer}>
      {services.map((service) => (
        <View key={service.id} style={styles.serviceItem}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceTitle}>
              {service.nameEN} - {service.nameAR}
            </Text>
            <View style={styles.servicePrice}>
              <Price value={service.price} headerShown={false} />
            </View>
          </View>
          
          <View style={styles.serviceDetails}>
            <View style={styles.serviceDetail}>
              <Ionicons name="bookmark-outline" size={16} color="#666" />
              <Text style={styles.serviceDetailText}>
                Category: {getCategoryNameById(service.categoryId)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const WorkersList = ({ workers }) => {
  if (!workers || workers.length === 0) {
    return (
      <Text style={styles.noDataText}>No workers found for this provider</Text>
    );
  }

  return (
    <View style={styles.listContainer}>
      {workers.map((worker, index) => (
        <View key={index} style={styles.workerItem}>
          <View style={styles.workerIcon}>
            <Ionicons name="person-circle-outline" size={40} color={Colors.primary} />
          </View>
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{worker.username}</Text>
            <View style={styles.workerContact}>
              <Ionicons name="call-outline" size={14} color="#666" />
              <Text style={styles.workerContactText}>{worker.phoneNumber}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const OrdersList = ({ orders, handleFilter }) => {
  const [activeFilters, setActiveFilters] = useState({ statusFilter: 'default' });
  const [filteredOrders, setFilteredOrders] = useState(orders || []);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const handleFilterApply = (filters) => {
    setActiveFilters(filters);
    
    if (filters.statusFilter === 'default') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => order.status === filters.statusFilter);
      setFilteredOrders(filtered);
    }
  };
  
  return (
    <View style={styles.tabContent}>
      <View style={styles.ordersHeader}>
        <Text style={styles.ordersTitle}>
          Provider Orders ({filteredOrders.length})
        </Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color={Colors.primary} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      {filteredOrders.length === 0 ? (
        <Text style={styles.noDataText}>
          No orders found {activeFilters.statusFilter !== 'default' ? 'with this filter' : ''}
        </Text>
      ) : (
        filteredOrders.map((order) => (
          <OrderItem key={order.id} order={order} />
        ))
      )}
      
      <CustomerOrdersFilter
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
        initialFilters={activeFilters}
      />
    </View>
  );
};

export default function ServiceProviderDetailsScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const { userData } = route.params;
  const [activeTab, setActiveTab] = useState("services");
  const [showManageOptions, setShowManageOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this service provider? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/admin/${userData.role}/${userData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Success", "Service provider deleted successfully",
        [
          {
            text: "OK", 
            onPress: () => navigation.replace("Accounts")
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to delete service provider");
    } finally {
      setIsLoading(false);
      setShowManageOptions(false);
    }
  };

  const handleBlacklistStatus = async () => {
    const actionText = userData.isBlacklisted ? "remove from" : "add to";
    
    Alert.alert(
      `Confirm Blacklist Action`,
      `Are you sure you want to ${actionText} blacklist for this service provider?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: confirmBlacklistChange
        }
      ]
    );
  };

  const confirmBlacklistChange = async () => {
    setIsLoading(true);
    const newStatus = !userData.isBlacklisted;
    
    try {
      await axios.patch(`${API_BASE_URL}/admin/users/blacklist`, {
        role: "SERVICE_PROVIDER",
        userId: userData.id,
        isBlacklisted: newStatus
      }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update local state to reflect the change
      userData.isBlacklisted = newStatus;
      
      const actionText = newStatus ? "added to" : "removed from";
      Alert.alert("Success", `Service provider ${actionText} blacklist successfully`,
        [
          {
            text: "OK",
            onPress: () => {
              // Use replace to go back to AccountsScreen with updated userData
              navigation.replace("Accounts", { updatedUserData: userData });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message[0] || "Failed to update blacklist status");
    } finally {
      setIsLoading(false);
      setShowManageOptions(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "services":
        return <ServicesList services={userData.services || []} />;
      case "workers":
        return <WorkersList workers={userData.workers || []} />;
      case "orders":
        return <OrdersList orders={userData.requests || []} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && <LoadingOverlay />}
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Provider Details</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.manageButton}
          onPress={() => setShowManageOptions(true)}
        >
          <Text style={styles.manageButtonText}>Manage</Text>
          <Ionicons name="ellipsis-vertical" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <ServiceProviderCard userData={userData} />
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === "services" && styles.activeTabButton
            ]}
            onPress={() => setActiveTab("services")}
          >
            <Ionicons 
              name="construct-outline" 
              size={20} 
              color={activeTab === "services" ? Colors.primary : "#666"} 
            />
            <Text style={[
              styles.tabButtonText,
              activeTab === "services" && styles.activeTabText
            ]}>
              Services
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === "workers" && styles.activeTabButton
            ]}
            onPress={() => setActiveTab("workers")}
          >
            <Ionicons 
              name="body-outline" 
              size={20} 
              color={activeTab === "workers" ? Colors.primary : "#666"} 
            />
            <Text style={[
              styles.tabButtonText,
              activeTab === "workers" && styles.activeTabText
            ]}>
              Workers
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === "orders" && styles.activeTabButton
            ]}
            onPress={() => setActiveTab("orders")}
          >
            <Ionicons 
              name="reader-outline" 
              size={20} 
              color={activeTab === "orders" ? Colors.primary : "#666"} 
            />
            <Text style={[
              styles.tabButtonText,
              activeTab === "orders" && styles.activeTabText
            ]}>
              Orders
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.contentContainer}>
          {renderTabContent()}
        </View>
      </ScrollView>

      {/* Manage Options Modal */}
      <Modal
        visible={showManageOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowManageOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowManageOptions(false)}
        >
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color="#e74c3c" />
              <Text style={[styles.optionText, { color: "#e74c3c" }]}>Delete Provider</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={handleBlacklistStatus}
            >
              {userData.isBlacklisted ? (
                <>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#27ae60" />
                  <Text style={[styles.optionText, { color: "#27ae60" }]}>Remove from Blacklist</Text>
                </>
              ) : (
                <>
                  <Ionicons name="ban-outline" size={24} color="#f39c12" />
                  <Text style={[styles.optionText, { color: "#f39c12" }]}>Add to Blacklist</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: Colors.primary,
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  manageButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: wp(3.5),
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: "#ddd",
  },
  activeTabButton: {
    borderBottomColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: wp(3.5),
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsContainer: {
    backgroundColor: "white",
    width: wp(80),
    borderRadius: 10,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 10,
  },
  optionText: {
    fontSize: wp(4),
    fontWeight: "500",
  },
  listContainer: {
    gap: 16,
  },
  serviceItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: Colors.primary,
    flex: 1,
  },
  servicePrice: {
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  servicePriceText: {
    color: "#27ae60",
    fontWeight: "bold",
    fontSize: wp(3.5),
  },
  serviceDetails: {
    gap: 8,
  },
  serviceDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  serviceDetailText: {
    fontSize: wp(3.5),
    color: "#666",
  },
  workerItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: "center",
  },
  workerIcon: {
    marginRight: 16,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  workerContact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  workerContactText: {
    fontSize: wp(3.5),
    color: "#666",
  },
  ordersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ordersTitle: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: "#333",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0f0f0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  filterText: {
    fontSize: wp(3.5),
    color: Colors.primary,
  },
  tabContent: {
    minHeight: hp(50),
  },
  noDataText: {
    textAlign: "center",
    fontSize: wp(4),
    color: "#666",
    marginTop: 20,
    marginBottom: 20,
  },
}); 