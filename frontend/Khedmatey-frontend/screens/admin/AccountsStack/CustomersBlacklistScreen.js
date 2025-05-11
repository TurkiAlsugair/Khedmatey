import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { Colors } from '../../../constants/styles';
import axios from 'axios';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../../context/AuthContext';
import Toast from 'react-native-toast-message';

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

const CustomerItem = ({ customer, onToggleBlacklist }) => {
  return (
    <View style={styles.customerCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.username}>{customer.username}</Text>
        <View style={[
          styles.blacklistBadge,
          customer.isBlacklisted === true || customer.isBlacklisted === "true" 
            ? styles.blacklisted 
            : styles.notBlacklisted
        ]}>
          <Text style={[
            styles.blacklistText,
            customer.isBlacklisted === true || customer.isBlacklisted === "true" 
              ? styles.blacklistedText 
              : styles.notBlacklistedText
          ]}>
            {customer.isBlacklisted === true || customer.isBlacklisted === "true" 
              ? "Blacklisted" 
              : "Not Blacklisted"}
          </Text>
        </View>
      </View>
      
      <View style={styles.contactInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>{customer.phoneNumber}</Text>
        </View>
        
        {customer.email && (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>{customer.email}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.actionButton,
          customer.isBlacklisted === true || customer.isBlacklisted === "true" 
            ? styles.unblacklistButton 
            : styles.blacklistButton
        ]}
        onPress={() => onToggleBlacklist(customer)}
      >
        <Ionicons 
          name={customer.isBlacklisted === true || customer.isBlacklisted === "true" 
            ? "checkmark-circle-outline" 
            : "ban-outline"} 
          size={20} 
          color="white" 
        />
        <Text style={styles.actionButtonText}>
          {customer.isBlacklisted === true || customer.isBlacklisted === "true" 
            ? "Remove from Blacklist" 
            : "Add to Blacklist"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function CustomersBlacklistScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('blacklisted');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  const fetchCustomers = async (blacklistStatus) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/users/lookup?blacklisted=${blacklistStatus}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCustomers(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(activeTab === 'blacklisted');
  }, [activeTab]);

  const handleToggleBlacklist = async (customer) => {
    const currentStatus = customer.isBlacklisted === true || customer.isBlacklisted === "true";
    const newStatus = !currentStatus;
    const actionText = currentStatus ? "remove from" : "add to";
    
    Alert.alert(
      `Confirm Blacklist Action`,
      `Are you sure you want to ${actionText} blacklist for ${customer.username}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
            try {
              setLoading(true);
              
              await axios.patch(`${API_BASE_URL}/admin/users/blacklistStatus`, {
                role: "CUSTOMER",
                id: customer.id,
                isBlacklisted: newStatus
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              // Update the customer in the list immediately
              setCustomers(prevCustomers => 
                prevCustomers.map(c => 
                  c.id === customer.id 
                    ? { ...c, isBlacklisted: newStatus.toString() } 
                    : c
                )
              );
              
              const actionDone = newStatus ? "added to" : "removed from";
              Toast.show({
                type: "success",
                text1: "Success",
                text2: `Customer ${actionDone} blacklist successfully`,
                visibilityTime: 2000,
                topOffset: hp(7),
              });
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: error.response?.data?.message || "Failed to update blacklist status",
                visibilityTime: 2000,
                topOffset: hp(7),
              });
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Customers</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'blacklisted' && styles.activeTab
          ]}
          onPress={() => setActiveTab('blacklisted')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'blacklisted' && styles.activeTabText
          ]}>
            Blacklisted
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'unblacklisted' && styles.activeTab
          ]}
          onPress={() => setActiveTab('unblacklisted')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'unblacklisted' && styles.activeTabText
          ]}>
            Not Blacklisted
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchCustomers(activeTab === 'blacklisted')}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CustomerItem 
              customer={item} 
              onToggleBlacklist={handleToggleBlacklist}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No {activeTab} customers found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: wp(4),
    color: '#666',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  customerCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#333',
  },
  blacklistBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  blacklisted: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
  },
  notBlacklisted: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  blacklistText: {
    fontSize: wp(3),
    fontWeight: 'bold',
  },
  blacklistedText: {
    color: '#e74c3c',
  },
  notBlacklistedText: {
    color: '#27ae60',
  },
  contactInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: wp(3.8),
    color: '#555',
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  blacklistButton: {
    backgroundColor: '#f39c12',
  },
  unblacklistButton: {
    backgroundColor: '#27ae60',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: wp(3.8),
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: wp(4),
    color: '#666',
    marginTop: 12,
  },
}); 