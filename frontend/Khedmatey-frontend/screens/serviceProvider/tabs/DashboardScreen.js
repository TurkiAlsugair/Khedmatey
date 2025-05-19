import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from "react-native";
import { Colors, ORDER_STATUS_STYLES } from "../.././../constants/styles";
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
  const [lastUpdated, setLastUpdated] = useState(null);
  
  useEffect(() => {
    fetchStatistics();
  }, []);
  
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/service-provider/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(response.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching statistics:", error);
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
    navigation.navigate("OrdersScreen", { status });
  };
  
  return (
    <>
    <StatusBar barStyle={"light-content"}/>
    <View style={[styles.container]}>
      <View style={[styles.headerCont, { paddingTop: insets.top + hp(1.5) }]}>
        <Text style={styles.companyText}>Khedmatey</Text>
        <Text style={styles.companyText}>|</Text>
        <Text style={styles.companyText}>{userInfo.username}</Text>
      </View>
      
      <ScrollView style={[styles.scrollContainer]} showsVerticalScrollIndicator={false}>
        <View style={[styles.contentCont, { paddingBottom: insets.top + hp(6.5) }]}>
          
          {/* Last Updated */}
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
          
          <Text style={styles.title}>Statistics</Text>
          <View style={styles.statsCont}>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ padding: 20 }} />
            ) : (
              <>
                <View style={styles.summaryStats}>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatValue}>{stats?.totalWorkers || 0}</Text>
                    <Text style={styles.summaryStatLabel}>Workers</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatValue}>{stats?.totalServices || 0}</Text>
                    <Text style={styles.summaryStatLabel}>Services</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatValue}>{stats?.totalRequests || 0}</Text>
                    <Text style={styles.summaryStatLabel}>Orders</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatValue}>{stats?.avgRating?.toFixed(2) || 0}</Text>
                    <Text style={styles.summaryStatLabel}>Rating</Text>
                  </View>
                </View>
                
                <View>
                  <Text
                    style={{ textAlign: "center", padding: 10, fontWeight: "bold", fontSize: wp(4.5) }}
                  >
                    Orders
                  </Text>
                </View>
                <View style={styles.statsInnerCont}>
                  <View 
                    style={styles.statCard}
                  >
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
                  
                  <View 
                    style={styles.statCard}
                  >
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
                  
                  <View 
                    style={styles.statCard}
                  >
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
                  
                  <View 
                    style={styles.statCard}
                  >
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
                  
                  <View 
                    style={styles.statCard}
                  >
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
                  
                  <View 
                    style={styles.statCard}
                  >
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
                  
                  <View 
                    style={styles.statCard}
                  >
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
                  
                  <View 
                    style={styles.statCard}
                  >
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
                  
                  <View 
                    style={[styles.statCard, { width: '100%' }]}
                  >
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
              </>
            )}
          </View>
          <Text style={styles.title}>Options</Text>
          <View style={styles.optionsCont}>
            <TouchableOpacity
              style={[styles.optionCont, { width: "100%" }]}
              onPress={() => navigation.navigate("ManageSchedule")}
            >
              <Text style={styles.optionText}>Schedule Management</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionCont}
              onPress={() => navigateToOrders("PENDING")}
            >
              <Text style={styles.optionText}>Pending Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionCont}
              onPress={() => navigateToOrders("ACCEPTED")}
            >
              <Text style={styles.optionText}>Accepted Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionCont}
              onPress={() => navigateToOrders("COMING")}
            >
              <Text style={styles.optionText}>Coming Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionCont}
              onPress={() => navigateToOrders("IN_PROGRESS")}
            >
              <Text style={styles.optionText}>In Progress Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionCont}
              onPress={() => navigateToOrders("FINISHED")}
            >
              <Text style={styles.optionText}>Finished Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionCont}
              onPress={() => navigateToOrders("INVOICED")}
            >
              <Text style={styles.optionText}>Invoiced Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionCont}
              onPress={() => navigateToOrders("CANCELED")}
            >
              <Text style={styles.optionText}>Canceled Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionCont}
              onPress={() => navigateToOrders("DECLINED")}
            >
              <Text style={styles.optionText}>Declined Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.optionCont, { width: "100%" }]}
              onPress={() => navigateToOrders("PAID")}
            >
              <Text style={styles.optionText}>Paid Orders</Text>
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
    // zIndex: 10,
  },
  optionsCont: {
    padding: 10,
    marginBottom: hp(2),
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 15,
  },
  optionCont: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    width: "47%",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: wp(3.5),
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
  companyText: {
    color: "white",
    fontSize: wp(4),
    fontWeight: "bold",
    textAlign: "center",
  },
  title: {
    fontSize: wp(5),
    marginBottom: 10,
    fontWeight: "bold",
    color: "black",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 10,
  },
  summaryStatItem: {
    width: "25%",
    alignItems: "center",
  },
  summaryStatValue: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: Colors.primary,
  },
  summaryStatLabel: {
    fontSize: wp(3),
    color: "#666",
    marginTop: 4,
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
});
