import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from "react-native";
import { Colors, ORDER_STATUS_STYLES } from "../../../constants/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function DashboardScreen({ navigation }) {
  const { userInfo, token } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  useEffect(() => {
    fetchStatistics();
  }, []);
  
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${API_BASE_URL}/service-provider/workers/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setStats(response.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching worker statistics:", error);
      setError(error.response?.data?.message || "Failed to load statistics");
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
  
  const navigateToOrders = (status) => {
    // Will be implemented when needed
    // navigation.navigate("OrdersList", { status });
  };
  
  return (
    <>
    <StatusBar barStyle={"light-content"}/>
    <View style={styles.container}>
      <View style={[styles.headerCont, { paddingTop: insets.top + hp(1.5) }]}>
        <Text style={styles.appText}>Khedmatey</Text>
        <Text style={styles.appText}>|</Text>
        <Text style={styles.appText}>{userInfo.username}</Text>
      </View>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.contentCont, { paddingBottom: insets.top + hp(6.5) }]}>
          
          {/* Last Updated Section */}
          {lastUpdated && (
            <View style={styles.lastUpdatedContainer}>
              <Text style={styles.lastUpdatedText}>
                Last updated at: {formatLastUpdated()}
              </Text>
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={fetchStatistics}
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
          
          {/* Worker Info */}
          {!loading && stats && (
            <View style={styles.workerInfoCard}>
              <View style={styles.workerAvatarContainer}>
                <Ionicons name="person" size={40} color={Colors.primary} />
              </View>
              <View style={styles.workerDetails}>
                <Text style={styles.workerName}>{stats.username}</Text>
                <Text style={styles.workerPhone}>{stats.phoneNumber}</Text>
                <Text style={styles.workerCity}>{stats.city}</Text>
              </View>
            </View>
          )}
          
          {/* Statistics Section */}
          <Text style={styles.title}>Statistics</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading statistics...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchStatistics}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.statsCont}>
              {/* Total Requests Summary */}
              <View style={styles.summaryStats}>
                <View style={styles.summaryStatItem}>
                  <Text style={styles.summaryStatValue}>{stats?.totalRequests || 0}</Text>
                  <Text style={styles.summaryStatLabel}>Total Orders</Text>
                </View>
              </View>
              
              {/* Orders by Status */}
              <View>
                <Text style={styles.statsSubtitle}>Orders by Status</Text>
              </View>
              
              <View style={styles.statsInnerCont}>
                {/* PENDING */}
                <View style={styles.statCard}>
                  <Text
                    style={[
                      styles.gridText,
                      {
                        backgroundColor: ORDER_STATUS_STYLES.PENDING.bg,
                        color: ORDER_STATUS_STYLES.PENDING.text,
                      },
                    ]}
                  >
                    PENDING: {stats?.requestsByStatus?.PENDING || 0}
                  </Text>
                </View>
                
                {/* ACCEPTED */}
                <View style={styles.statCard}>
                  <Text
                    style={[
                      styles.gridText,
                      {
                        backgroundColor: ORDER_STATUS_STYLES.ACCEPTED.bg,
                        color: ORDER_STATUS_STYLES.ACCEPTED.text,
                      },
                    ]}
                  >
                    ACCEPTED: {stats?.requestsByStatus?.ACCEPTED || 0}
                  </Text>
                </View>
                
                {/* COMING */}
                <View style={styles.statCard}>
                  <Text
                    style={[
                      styles.gridText,
                      {
                        backgroundColor: ORDER_STATUS_STYLES.COMING.bg,
                        color: ORDER_STATUS_STYLES.COMING.text,
                      },
                    ]}
                  >
                    COMING: {stats?.requestsByStatus?.COMING || 0}
                  </Text>
                </View>
                
                {/* IN_PROGRESS */}
                <View style={styles.statCard}>
                  <Text
                    style={[
                      styles.gridText,
                      {
                        backgroundColor: ORDER_STATUS_STYLES["IN_PROGRESS"].bg,
                        color: ORDER_STATUS_STYLES["IN_PROGRESS"].text,
                      },
                    ]}
                  >
                    IN_PROGRESS: {stats?.requestsByStatus?.IN_PROGRESS || 0}
                  </Text>
                </View>
                
                {/* FINISHED */}
                <View style={styles.statCard}>
                  <Text
                    style={[
                      styles.gridText,
                      {
                        backgroundColor: ORDER_STATUS_STYLES.FINISHED.bg,
                        color: ORDER_STATUS_STYLES.FINISHED.text,
                      },
                    ]}
                  >
                    FINISHED: {stats?.requestsByStatus?.FINISHED || 0}
                  </Text>
                </View>
                
                {/* INVOICED */}
                <View style={styles.statCard}>
                  <Text
                    style={[
                      styles.gridText,
                      {
                        backgroundColor: ORDER_STATUS_STYLES.INVOICED.bg,
                        color: ORDER_STATUS_STYLES.INVOICED.text,
                      },
                    ]}
                  >
                    INVOICED: {stats?.requestsByStatus?.INVOICED || 0}
                  </Text>
                </View>
                
                {/* CANCELED */}
                <View style={styles.statCard}>
                  <Text
                    style={[
                      styles.gridText,
                      {
                        backgroundColor: ORDER_STATUS_STYLES.CANCELED.bg,
                        color: ORDER_STATUS_STYLES.CANCELED.text,
                      },
                    ]}
                  >
                    CANCELED: {stats?.requestsByStatus?.CANCELED || 0}
                  </Text>
                </View>
                
                {/* DECLINED */}
                <View style={styles.statCard}>
                  <Text
                    style={[
                      styles.gridText,
                      {
                        backgroundColor: ORDER_STATUS_STYLES.DECLINED.bg,
                        color: ORDER_STATUS_STYLES.DECLINED.text,
                      },
                    ]}
                  >
                    DECLINED: {stats?.requestsByStatus?.DECLINED || 0}
                  </Text>
                </View>
                
                {/* PAID */}
                <View style={[styles.statCard, { width: '100%' }]}>
                  <Text
                    style={[
                      styles.gridText,
                      {
                        backgroundColor: ORDER_STATUS_STYLES.PAID.bg,
                        color: ORDER_STATUS_STYLES.PAID.text,
                        width: '100%',
                      },
                    ]}
                  >
                    PAID: {stats?.requestsByStatus?.PAID || 0}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  scrollContainer: {
    flex: 1,
  },
  contentCont: {
    padding: 10,
    paddingBottom: hp(5),
  },
  headerCont: {
    backgroundColor: Colors.primary,
    padding: 20,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: hp(2),
  },
  appText: {
    color: "white",
    fontSize: wp(4),
    fontWeight: "bold",
    textAlign: "center",
  },
  title: {
    fontSize: wp(5),
    marginBottom: 10,
    marginTop: 10,
    fontWeight: "bold",
    color: "black",
  },
  statsSubtitle: {
    textAlign: "center",
    padding: 10,
    fontWeight: "bold",
    fontSize: wp(4.5),
  },
  statsCont: {
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
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
  statCard: {
    width: "48%",
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: wp(3.5),
  },
  errorContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 10,
    marginBottom: 15,
    color: "#e74c3c",
    fontSize: wp(3.5),
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  summaryStats: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 10,
  },
  summaryStatItem: {
    alignItems: "center",
  },
  summaryStatValue: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: Colors.primary,
  },
  summaryStatLabel: {
    fontSize: wp(3.5),
    color: "#666",
    marginTop: 4,
  },
  workerInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workerAvatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  workerPhone: {
    fontSize: wp(3.5),
    color: "#666",
    marginBottom: 4,
  },
  workerCity: {
    fontSize: wp(3.5),
    color: Colors.primary,
  },
});
