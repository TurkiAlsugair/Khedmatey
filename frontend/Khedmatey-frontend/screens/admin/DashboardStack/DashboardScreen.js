import React, { useState, useEffect, useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Colors, ORDER_STATUS_STYLES } from "../../../constants/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import Toast from "react-native-toast-message";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Card component for displaying summary stats
const StatCard = ({ title, count, icon, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color="white" />
    </View>
    <Text style={styles.statValue}>{count}</Text>
    <Text style={styles.statLabel}>{title}</Text>
  </View>
);

export default function DashboardScreen({ navigation }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { token, userInfo } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const fetchDashboardData = async () => {
    try {
      if (!token) return;
      
      if (!dashboardData) setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDashboardData(response.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch dashboard data";
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
    }
  };

  // Format last updated time as "HH:MM:SS"
  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    
    const hours = lastUpdated.getHours().toString().padStart(2, '0');
    const minutes = lastUpdated.getMinutes().toString().padStart(2, '0');
    const seconds = lastUpdated.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    // Initial fetch
    fetchDashboardData();
  }, []);

  // Helper to safely get number as string
  const getCountAsString = (value) => {
    return value !== undefined ? value.toString() : '0';
  };

  const navigateToSection = (section) => {
    // For future implementation - navigate to specific sections
    Toast.show({
      type: "info",
      text1: `Navigate to ${section}`,
      visibilityTime: 2000,
      topOffset: hp(7),
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
    <View style={styles.container}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.contentCont, { paddingBottom: insets.top + hp(6.5) }]}>
            
            {/* Last Updated */}
            {lastUpdated && (
              <View style={styles.lastUpdatedContainer}>
                <Text style={styles.lastUpdatedText}>
                  Last updated at: {formatLastUpdated()}
                </Text>
                <TouchableOpacity 
                  style={styles.refreshButton} 
                  onPress={fetchDashboardData}
                  disabled={loading}
                >
                  <Ionicons 
                    name="refresh" 
                    size={wp(5)} 
                    color={Colors.primary} 
                  />
                </TouchableOpacity>
              </View>
            )}
            
            {/* Summary Stats */}
            <Text style={styles.title}>Summary</Text>
            <View style={styles.summaryContainer}>
              <StatCard 
                title="Service Providers" 
                count={getCountAsString(dashboardData?.serviceProviders?.total)} 
                icon="business-outline" 
                color="#8e44ad"
              />
              <StatCard 
                title="Customers" 
                count={getCountAsString(dashboardData?.customers?.total)} 
                icon="people-outline" 
                color="#3498db"
              />
              <StatCard 
                title="Services" 
                count={getCountAsString(dashboardData?.services?.total)} 
                icon="construct-outline" 
                color="#e67e22"
              />
              <StatCard 
                title="Workers" 
                count={getCountAsString(dashboardData?.workers?.total)} 
                icon="person-outline" 
                color="#27ae60"
              />
            </View>
            
            {/* Service Providers Status */}
            <Text style={styles.title}>Service Providers</Text>
            <View style={styles.statsCont}>
              <View>
                <Text
                  style={{ textAlign: "center", padding: 10, fontWeight: "bold", fontSize: wp(4.5) }}
                >
                  Status
                </Text>
              </View>
              <View style={styles.statsInnerCont}>
                {dashboardData?.serviceProviders?.byStatus?.PENDING !== undefined && (
                  <View style={styles.statGridCard}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: '#fff7d9',
                          color: '#e0a300',
                        },
                      ]}
                    >
                      PENDING: {getCountAsString(dashboardData.serviceProviders.byStatus.PENDING)}
                    </Text>
                  </View>
                )}
                
                {dashboardData?.serviceProviders?.byStatus?.DECLINED !== undefined && (
                  <View style={styles.statGridCard}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: '#fdeaea',
                          color: '#b22222',
                        },
                      ]}
                    >
                      DECLINED: {getCountAsString(dashboardData.serviceProviders.byStatus.DECLINED)}
                    </Text>
                  </View>
                )}
                
                {dashboardData?.serviceProviders?.byStatus?.ACCEPTED !== undefined && (
                  <View style={styles.statGridCardFullWidth}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: '#e6f9e6',
                          color: '#32cd32',
                        },
                      ]}
                    >
                      ACCEPTED: {getCountAsString(dashboardData.serviceProviders.byStatus.ACCEPTED)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Services Status */}
            <Text style={styles.title}>Services</Text>
            <View style={styles.statsCont}>
              <View>
                <Text
                  style={{ textAlign: "center", padding: 10, fontWeight: "bold", fontSize: wp(4.5) }}
                >
                  Status
                </Text>
              </View>
              <View style={styles.statsInnerCont}>
                {dashboardData?.services?.byStatus?.PENDING !== undefined && (
                  <View style={styles.statGridCard}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: '#fff7d9',
                          color: '#e0a300',
                        },
                      ]}
                    >
                      PENDING: {getCountAsString(dashboardData.services.byStatus.PENDING)}
                    </Text>
                  </View>
                )}
                
                {dashboardData?.services?.byStatus?.DECLINED !== undefined && (
                  <View style={styles.statGridCard}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: '#fdeaea',
                          color: '#b22222',
                        },
                      ]}
                    >
                      DECLINED: {getCountAsString(dashboardData.services.byStatus.DECLINED)}
                    </Text>
                  </View>
                )}
                
                {dashboardData?.services?.byStatus?.ACCEPTED !== undefined && (
                  <View style={styles.statGridCardFullWidth}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: '#e6f9e6',
                          color: '#32cd32',
                        },
                      ]}
                    >
                      ACCEPTED: {getCountAsString(dashboardData.services.byStatus.ACCEPTED)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Requests/Orders Stats */}
            <Text style={styles.title}>Orders</Text>
            <View style={styles.statsCont}>
              <View>
                <Text
                  style={{ textAlign: "center", padding: 10, fontWeight: "bold", fontSize: wp(4.5) }}
                >
                  Status
                </Text>
              </View>
              <View style={styles.statsInnerCont}>
                {dashboardData?.requests?.byStatus?.PENDING !== undefined && (
                  <View style={styles.statGridCard}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: ORDER_STATUS_STYLES.PENDING.bg,
                          color: ORDER_STATUS_STYLES.PENDING.text,
                        },
                      ]}
                    >
                      PENDING: {getCountAsString(dashboardData.requests.byStatus.PENDING)}
                    </Text>
                  </View>
                )}
                
                {dashboardData?.requests?.byStatus?.ACCEPTED !== undefined && (
                  <View style={styles.statGridCard}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: ORDER_STATUS_STYLES.ACCEPTED.bg,
                          color: ORDER_STATUS_STYLES.ACCEPTED.text,
                        },
                      ]}
                    >
                      ACCEPTED: {getCountAsString(dashboardData.requests.byStatus.ACCEPTED)}
                    </Text>
                  </View>
                )}
                
                {dashboardData?.requests?.byStatus?.COMING !== undefined && (
                  <View style={styles.statGridCard}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: ORDER_STATUS_STYLES.COMING.bg,
                          color: ORDER_STATUS_STYLES.COMING.text,
                        },
                      ]}
                    >
                      COMING: {getCountAsString(dashboardData.requests.byStatus.COMING)}
                    </Text>
                  </View>
                )}
                
                {dashboardData?.requests?.byStatus?.IN_PROGRESS !== undefined && (
                  <View style={styles.statGridCard}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: ORDER_STATUS_STYLES["IN_PROGRESS"].bg,
                          color: ORDER_STATUS_STYLES["IN_PROGRESS"].text,
                        },
                      ]}
                    >
                      IN_PROGRESS: {getCountAsString(dashboardData.requests.byStatus.IN_PROGRESS)}
                    </Text>
                  </View>
                )}
                
                {dashboardData?.requests?.byStatus?.FINISHED !== undefined && (
                  <View style={styles.statGridCard}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: ORDER_STATUS_STYLES.FINISHED.bg,
                          color: ORDER_STATUS_STYLES.FINISHED.text,
                        },
                      ]}
                    >
                      FINISHED: {getCountAsString(dashboardData.requests.byStatus.FINISHED)}
                    </Text>
                  </View>
                )}
                
                {dashboardData?.requests?.byStatus?.INVOICED !== undefined && (
                  <View style={styles.statGridCard}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: ORDER_STATUS_STYLES.INVOICED.bg,
                          color: ORDER_STATUS_STYLES.INVOICED.text,
                        },
                      ]}
                    >
                      INVOICED: {getCountAsString(dashboardData.requests.byStatus.INVOICED)}
                    </Text>
                  </View>
                )}
                
                {dashboardData?.requests?.byStatus?.CANCELED !== undefined && (
                  <View style={styles.statGridCard}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: ORDER_STATUS_STYLES.CANCELED.bg,
                          color: ORDER_STATUS_STYLES.CANCELED.text,
                        },
                      ]}
                    >
                      CANCELED: {getCountAsString(dashboardData.requests.byStatus.CANCELED)}
                    </Text>
                  </View>
                )}
                
                {dashboardData?.requests?.byStatus?.DECLINED !== undefined && (
                  <View style={styles.statGridCard}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: ORDER_STATUS_STYLES.DECLINED.bg,
                          color: ORDER_STATUS_STYLES.DECLINED.text,
                        },
                      ]}
                    >
                      DECLINED: {getCountAsString(dashboardData.requests.byStatus.DECLINED)}
                    </Text>
                  </View>
                )}
                
                {dashboardData?.requests?.byStatus?.PAID !== undefined && (
                  <View style={styles.statGridCardFullWidth}>
                    <Text
                      style={[
                        styles.gridText,
                        {
                          backgroundColor: ORDER_STATUS_STYLES.PAID.bg,
                          color: ORDER_STATUS_STYLES.PAID.text,
                        },
                      ]}
                    >
                      PAID: {getCountAsString(dashboardData.requests.byStatus.PAID)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Options */}
            <Text style={styles.title}>Options</Text>
            <View style={styles.optionsCont}>
              <TouchableOpacity
                style={styles.optionCont}
                onPress={() => navigation.navigate("UnhandledRequests")}
              >
                <Text style={styles.optionText}>View Unhandled Orders</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
    </View>
    </>
  );
}

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
    color: '#555',
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
    color: '#e74c3c',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: wp(4),
  },
  scrollContainer: {
    flex: 1,
  },
  contentCont: {
    padding: 16,
  },
  title: {
    fontSize: wp(5),
    marginBottom: 10,
    marginTop: 10,
    fontWeight: "bold",
    color: "#333",
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: wp(3.5),
    color: '#666',
    textAlign: 'center',
  },
  statsCont: {
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 10,
    marginBottom: hp(2),
  },
  statsInnerCont: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    padding: 5,
  },
  statGridCard: {
    width: "48%",
  },
  statGridCardFullWidth: {
    width: "100%",
  },
  gridText: {
    borderRadius: 8,
    padding: 10,
    width: "100%",
    textAlign: "center",
    fontWeight: "600",
    fontSize: wp(3.3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  optionsCont: {
    padding: 5,
    marginBottom: hp(2),
  },
  optionCont: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: hp(8),
  },
  optionText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: wp(4),
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    // backgroundColor: '#f9f9f9',
    // padding: 10,
    borderRadius: 8,
  },
  lastUpdatedText: {
    fontSize: wp(3.5),
    color: '#666',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
