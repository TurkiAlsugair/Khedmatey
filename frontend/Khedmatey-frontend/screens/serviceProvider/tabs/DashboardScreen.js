import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { Colors, ORDER_STATUS_STYLES } from "../.././../constants/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

export default function DashboardScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  
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
          <Text style={styles.title}>Statistics</Text>
          <View style={styles.statsCont}>
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
                  PENDING: 27
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
                  ACCEPTED: 33
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
                  COMING: 12
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
                  IN_PROGRESS: 8
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
                  FINISHED: 15
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
                  INVOICED: 10
                </Text>
              </View>
              
              <View 
                style={styles.statCard}
              >
                <Text
                  style={[
                    styles.gridText,
                    {
                      backgroundColor: ORDER_STATUS_STYLES.CANCELLED.bg,
                      color: ORDER_STATUS_STYLES.CANCELLED.text,
                    },
                  ]}
                >
                  CANCELLED: 5
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
                  DECLINED: 3
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
                  PAID: 20
                </Text>
              </View>
            </View>
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
              onPress={() => navigateToOrders("CANCELLED")}
            >
              <Text style={styles.optionText}>Cancelled Orders</Text>
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
});
