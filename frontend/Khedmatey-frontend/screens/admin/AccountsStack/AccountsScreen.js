import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, TextInput } from "react-native";
import { Colors, ORDER_STATUS_STYLES } from "../../../constants/styles";
import Button from "../../../components/UI/Button";
import LoadingOverlay from "../../../components/LoadingOverlay";
import axios from "axios";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function AccountsScreen({ navigation, route }) {
  const {token} = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check for updatedUserData when screen is focused or params change
  useEffect(() => {
    if (route.params?.updatedUserData) {
      setUserData(route.params.updatedUserData);
      setPhoneNumber(route.params.updatedUserData.phoneNumber);
      // Clean up route params to avoid infinite updates
      navigation.setParams({ updatedUserData: null });
    }
  }, [route.params?.updatedUserData]);

  useFocusEffect(
    React.useCallback(() => {
      if (userData && phoneNumber && !route.params?.updatedUserData) {
        handleSearch();
      }
      return () => {};
    }, [phoneNumber, token, route.params?.updatedUserData])
  );

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\+9665[0-9]{8}$/;
    return phoneRegex.test(number);
  };

  const handleSearch = async () => {
    setError("");
    
    if (!validatePhoneNumber(phoneNumber)) {
      setError("Phone number must be in format: +9665XXXXXXXX");
      return;
    }

    setIsLoading(true);
    
    try {
      const encodedPhoneNumber = encodeURIComponent(phoneNumber);
      console.log(`/admin/users/lookup?phoneNumber=${encodedPhoneNumber}`);
      const response = await axios.get(`${API_BASE_URL}/admin/users/lookup?phoneNumber=${encodedPhoneNumber}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("User data:", response.data.data);
      setUserData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch user data");
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToCustomerBlacklist = () => {
    navigation.navigate("CustomersBlacklist");
  };

  const navigateToProviderBlacklist = () => {
    navigation.navigate("ServiceProvidersBlacklist");
  };

  const handleUserPress = () => {
    if (!userData) return;
    
    if (userData.role === "CUSTOMER") {
      navigation.navigate("CustomerDetails", { userData });
    } else if (userData.role === "SERVICE_PROVIDER") {
      navigation.navigate("ServiceProviderDetails", { userData });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && <LoadingOverlay />}
      
      <View style={styles.contentContainer}>
        <Text style={styles.descriptionText}>
          Search for users by entering their phone number to view their profile and manage their account status.
        </Text>
        
        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="+9665XXXXXXXX"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Ionicons name="search" size={wp(6)} color="white" />
              </TouchableOpacity>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>

        <ScrollView 
          style={styles.resultContainer}
          contentContainerStyle={styles.resultContentContainer}
        >
          {userData && (
            <>
              <TouchableOpacity 
                style={styles.userCard}
                onPress={handleUserPress}
                activeOpacity={0.7}
              >
                <View style={styles.userHeader}>
                  <View style={[
                    styles.roleBadge, 
                    userData.role === "CUSTOMER" ? styles.customerBadge : styles.providerBadge
                  ]}>
                    <Text style={[
                      styles.roleText,
                      userData.role === "CUSTOMER" ? styles.customerText : styles.providerText
                    ]}>
                      {userData.role === "CUSTOMER" ? "Customer" : "Service Provider"}
                    </Text>
                  </View>
                      <Text style={styles.username} numberOfLines={2}>{userData.username}</Text>
                </View>
                
                <View style={styles.userDetailsContainer}>
                  <Text style={styles.sectionTitle}>Contact Info</Text>
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={16} color={Colors.primary} />
                    <Text style={styles.userDetail}>{userData.phoneNumber}</Text>
                  </View>
                  
                  {userData.email && (
                    <View style={styles.detailRow}>
                      <Ionicons name="mail-outline" size={16} color={Colors.primary} />
                      <Text style={styles.userDetail}>{userData.email}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Blacklisted Status: </Text>
                  <View style={[
                    styles.statusBadge, 
                    userData.isBlacklisted ? styles.blacklistedBadge : styles.notBlacklistedBadge
                  ]}>
                    <Text style={[
                      styles.statusText,
                      userData.isBlacklisted ? styles.blacklistedText : styles.notBlacklistedText
                    ]}>
                      {userData.isBlacklisted ? "Blacklisted" : "Not Blacklisted"}
                    </Text>
                  </View>
                </View>

                {userData.role === "SERVICE_PROVIDER" && (
                  <View style={styles.extraInfo}>
                    <Text style={styles.sectionTitle}>Cities:</Text>
                    <View style={styles.chips}>
                      {userData.cities.map((city, index) => (
                        <View key={index} style={styles.chip}>
                          <Ionicons name="location-outline" size={12} color="#666" />
                          <Text style={styles.chipText}>{city}</Text>
                        </View>
                      ))}
                    </View>
                    
                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Ionicons name="construct-outline" size={18} color={Colors.primary} />
                        <Text style={styles.statValue}>{userData.services?.length || 0}</Text>
                        <Text style={styles.statLabel}>Services</Text>
                      </View>
                      
                      <View style={styles.statItem}>
                        <Ionicons name="body-outline" size={18} color={Colors.primary} />
                        <Text style={styles.statValue}>{userData.workers?.length || 0}</Text>
                        <Text style={styles.statLabel}>Workers</Text>
                      </View>
                      
                      <View style={styles.statItem}>
                        <Ionicons name="reader-outline" size={18} color={Colors.primary} />
                        <Text style={styles.statValue}>{userData.requests?.length || 0}</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                      </View>
                    </View>
                  </View>
                )}

                {userData.role === "CUSTOMER" && (
                  <View style={styles.extraInfo}>
                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Ionicons name="reader-outline" size={18} color={Colors.primary} />
                        <Text style={styles.statValue}>{userData.requests?.length || 0}</Text>
                        <Text style={styles.statLabel}>Total Orders</Text>
                      </View>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
        
        <View style={styles.blacklistSection}>
          <Text style={styles.blacklistTitle}>Blacklist Management</Text>
          <View style={styles.blacklistButtonsContainer}>
            <Button 
              onPress={navigateToCustomerBlacklist} 
              cusStyles={styles.blacklistButton}
            >
              Manage Customers
            </Button>
            <Button 
              onPress={navigateToProviderBlacklist} 
              cusStyles={styles.blacklistButton}
            >
              Manage Providers
            </Button>
          </View>
        </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  descriptionText: {
    fontSize: wp(3.8),
    color: '#555',
    marginBottom: 16,
    lineHeight: wp(5.5),
  },
  searchContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: wp(3.5),
    marginBottom: 6,
    color: '#333',
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 48,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: wp(3.5),
  },
  searchButton: {
    height: 48,
    width: 48,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  errorText: {
    color: 'red',
    fontSize: wp(3.2),
    marginTop: 6,
  },
  resultContainer: {
    flex: 1,
  },
  resultContentContainer: {
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  userHeader: {
    flexDirection: "column",
    // justifyContent: "flex-start",
    // alignItems: "flex-start",
    marginBottom: 12,
    gap: 8,
  },
  username: {
    fontSize: wp(4.8),
    fontWeight: "bold",
    color: Colors.primary,
    flexWrap: 'wrap',
    // width: '0%',
  },
  roleBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  customerBadge: {
    backgroundColor: "rgba(52, 152, 219, 0.15)",
  },
  providerBadge: {
    backgroundColor: "rgba(155, 89, 182, 0.15)",
  },
  roleText: {
    fontSize: wp(3),
    fontWeight: "bold",
  },
  customerText: {
    color: "#3498db",
  },
  providerText: {
    color: "#9b59b6",
  },
  userDetailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  userDetail: {
    fontSize: wp(3.5),
    color: "#444",
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  statusLabel: {
    fontSize: wp(3.5),
    color: "#444",
    fontWeight: "500",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  blacklistedBadge: {
    backgroundColor: "rgba(231, 76, 60, 0.15)",
  },
  notBlacklistedBadge: {
    backgroundColor: "rgba(46, 204, 113, 0.15)",
  },
  statusText: {
    fontSize: wp(3),
    fontWeight: "bold",
  },
  blacklistedText: {
    color: "#e74c3c",
  },
  notBlacklistedText: {
    color: "#2ecc71",
  },
  extraInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  sectionTitle: {
    fontSize: wp(3.8),
    fontWeight: "bold",
    marginBottom: 8,
    color: "#555",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: wp(3),
    color: "#666",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  statItem: {
    alignItems: "center",
    padding: 10,
  },
  statValue: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: wp(3),
    color: "#666",
  },
  blacklistSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  blacklistTitle: {
    fontSize: wp(4.2),
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  blacklistButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  blacklistButton: {
    flex: 0.48,
  },
});
