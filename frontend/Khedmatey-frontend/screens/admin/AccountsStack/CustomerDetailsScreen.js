import React, { useContext, useState } from "react";
import { 
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal 
} from "react-native";
import { AuthContext } from "../../../context/AuthContext";
import { Colors, ORDER_STATUS_STYLES } from "../../../constants/styles";
import Button from "../../../components/UI/Button";
import axios from "axios";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import CustomerCard from "./components/CustomerCard";
import OrderItem from "./components/OrderItem";
import CustomerOrdersFilter from "./components/CustomerOrdersFilter";
import LoadingOverlay from "../../../components/LoadingOverlay";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function CustomerDetailsScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const { userData } = route.params;
  const [orders, setOrders] = useState(userData.requests || []);
  const [filteredOrders, setFilteredOrders] = useState(userData.requests || []);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ statusFilter: 'default' });
  const [showManageOptions, setShowManageOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterApply = (filters) => {
    setActiveFilters(filters);
    
    if (filters.statusFilter === 'default') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => order.status === filters.statusFilter);
      setFilteredOrders(filtered);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this customer? This action cannot be undone.",
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
      Alert.alert("Success", "Customer deleted successfully", 
        [
          {
            text: "OK", 
            onPress: () => navigation.replace("Accounts")
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to delete customer");
    } finally {
      setIsLoading(false);
      setShowManageOptions(false);
    }
  };

  const handleBlacklistStatus = async () => {
    const actionText = userData.isBlacklisted ? "remove from" : "add to";
    
    Alert.alert(
      `Confirm Blacklist Action`,
      `Are you sure you want to ${actionText} blacklist for this customer?`,
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
        role: "CUSTOMER",
        userId: userData.id,
        isBlacklisted: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Update local state to reflect the change
      userData.isBlacklisted = newStatus;
      
      const actionText = newStatus ? "added to" : "removed from";
      Alert.alert("Success", `Customer ${actionText} blacklist successfully`, 
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

  return (
    <View style={styles.container}>
      {isLoading && <LoadingOverlay />}
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Customer Details</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.manageButton}
            onPress={() => setShowManageOptions(true)}
          >
            <Text style={styles.manageButtonText}>Manage</Text>
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <CustomerCard userData={userData} />
        
        <View style={styles.ordersContainer}>
          <View style={styles.ordersHeader}>
            <Text style={styles.ordersTitle}>
              Customer Orders ({filteredOrders.length})
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
            <Text style={styles.noOrdersText}>
              No orders found {activeFilters.statusFilter !== 'default' ? 'with this filter' : ''}
            </Text>
          ) : (
            filteredOrders.map((order) => (
              <OrderItem key={order.id} order={order} />
            ))
          )}
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
              <Text style={[styles.optionText, { color: "#e74c3c" }]}>Delete Customer</Text>
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

      {/* Filter Modal */}
      <CustomerOrdersFilter
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
  ordersContainer: {
    padding: 16,
    marginTop: 10,
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
  noOrdersText: {
    textAlign: "center",
    fontSize: wp(4),
    color: "#666",
    marginTop: 20,
    marginBottom: 20,
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
}); 