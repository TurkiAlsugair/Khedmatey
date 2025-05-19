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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const ServiceProviderItem = ({ provider, onToggleBlacklist }) => {
  return (
    <View style={styles.providerCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.username}>{provider.username}</Text>
        <View style={[
          styles.blacklistBadge,
          provider.isBlacklisted ? styles.blacklisted : styles.notBlacklisted
        ]}>
          <Text style={[
            styles.blacklistText,
            provider.isBlacklisted ? styles.blacklistedText : styles.notBlacklistedText
          ]}>
            {provider.isBlacklisted ? "Blacklisted" : "Not Blacklisted"}
          </Text>
        </View>
      </View>
      
      <View style={styles.contactInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>{provider.phoneNumber}</Text>
        </View>
        
        {provider.email && (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>{provider.email}</Text>
          </View>
        )}
      </View>
      
      {provider.cities && provider.cities.length > 0 && (
        <View style={styles.citiesContainer}>
          <Text style={styles.citiesLabel}>Operating Cities:</Text>
          <View style={styles.citiesWrapper}>
            {provider.cities.map((city, index) => (
              <View key={index} style={styles.cityChip}>
                <Ionicons name="location-outline" size={14} color={Colors.primary} />
                <Text style={styles.cityText}>{city}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <TouchableOpacity 
        style={[
          styles.actionButton,
          provider.isBlacklisted ? styles.unblacklistButton : styles.blacklistButton
        ]}
        onPress={() => onToggleBlacklist(provider)}
      >
        <Ionicons 
          name={provider.isBlacklisted ? "checkmark-circle-outline" : "ban-outline"} 
          size={20} 
          color="white" 
        />
        <Text style={styles.actionButtonText}>
          {provider.isBlacklisted ? "Remove from Blacklist" : "Add to Blacklist"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function ServiceProvidersBlacklistScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('blacklisted');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  const fetchProviders = async (blacklistStatus) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/users/lookup?blacklisted=${blacklistStatus}&role=SERVICE_PROVIDER`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setProviders(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch service providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders(activeTab === 'blacklisted');
  }, [activeTab]);

  const handleToggleBlacklist = async (provider) => {
    const currentStatus = provider.isBlacklisted;
    const newStatus = !currentStatus;
    const actionText = currentStatus ? "remove from" : "add to";
    
    Alert.alert(
      `Confirm Blacklist Action`,
      `Are you sure you want to ${actionText} blacklist for ${provider.username}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
            try {
              setLoading(true);
              
              await axios.patch(`${API_BASE_URL}/admin/users/blacklist`, {
                role: "SERVICE_PROVIDER",
                userId: provider.id,
                isBlacklisted: newStatus
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              // Update the provider in the list immediately
              setProviders(prevProviders => 
                prevProviders.map(p => 
                  p.id === provider.id 
                    ? { ...p, isBlacklisted: newStatus } 
                    : p
                )
              );
              
              const actionDone = newStatus ? "added to" : "removed from";
              Toast.show({
                type: "success",
                text1: "Success",
                text2: `Service provider ${actionDone} blacklist successfully`,
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
        <Text style={styles.headerTitle}>Manage Service Providers</Text>
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
            onPress={() => fetchProviders(activeTab === 'blacklisted')}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ServiceProviderItem 
              provider={item} 
              onToggleBlacklist={handleToggleBlacklist}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No {activeTab} service providers found</Text>
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
  providerCard: {
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
  citiesContainer: {
    marginBottom: 16,
  },
  citiesLabel: {
    fontSize: wp(3.8),
    fontWeight: '500',
    color: '#444',
    marginBottom: 8,
  },
  citiesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  cityText: {
    fontSize: wp(3.2),
    color: '#555',
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
    // color: 'red',
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