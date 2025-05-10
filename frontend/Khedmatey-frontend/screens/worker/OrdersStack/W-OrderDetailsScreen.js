import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import socket from "../../../utility/socket";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ORDER_STATUS_STYLES } from "../../../constants/styles";
import { fetchOrderDetails } from "../../../utility/order";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

// Main status components
import PendingContent from "../../../components/Orders/W-Orders/OrderDetails/PendingContent";
import AcceptedContent from "../../../components/Orders/W-Orders/OrderDetails/AcceptedContent";
import ComingContent from "../../../components/Orders/W-Orders/OrderDetails/ComingContent";
import InProgressContent from "../../../components/Orders/W-Orders/OrderDetails/InProgerssContent";

// Final status components
import FinishedContent from "../../../components/Orders/W-Orders/OrderDetails/FinishedContent";

import InvoicedContent from "../../../components/Orders/W-Orders/OrderDetails/InvoicedContent";
import CancelledContent from "../../../components/Orders/W-Orders/OrderDetails/CancelledContent";
import DeclinedContent from "../../../components/Orders/W-Orders/OrderDetails/DeclinedContent";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

const MAIN_STATUSES = ["PENDING", "ACCEPTED", "COMING", "IN-PROGRESS"];
const FINAL_STATUSES = ["FINISHED", "INVOICED", "CANCELLED", "DECLINED"];

const ICONS = {
  PENDING: "time-outline",
  ACCEPTED: "checkmark-circle-outline",
  COMING: "car-outline",
  "IN-PROGRESS": "hammer-outline",
};

export default function OrderDetailsScreen({ navigation, route }) {
  const { id, orderStatus } = route.params;
  const { token } = useContext(AuthContext);

  const [status, setStatus] = useState(orderStatus);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const getOrderDetails = async () => {
      try {
        const data = await fetchOrderDetails(token, id);
        setOrderData(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || "Something went wrong.");
        setLoading(false);
      }
    };

    getOrderDetails();
  }, [id, token]);

  useEffect(() => {
    // join the room that has the orderId = id
    socket.emit("joinOrderRoom", { orderId: id });

    // listening for any status changes happen to that order
    socket.on("orderStatusUpdate", (orderData) => {
      if (orderData.orderId === id) {
        setStatus(orderData.status);
      }
    });

    return () => {
      socket.emit("leaveOrderRoom", { orderId: id });
      socket.off("orderStatusUpdate");
    };
  }, [id]);

  function changeStatus(status) {
    setStatus(status);
  }

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
      </View>
    );
  }

  const isFinalStatus = FINAL_STATUSES.includes(status);
  const isFollowUpOrder = !!orderData.followUpService;

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {!isFinalStatus && (
          <View style={styles.statusesCont}>
            {MAIN_STATUSES.map((item, index) => {
              const isActive = MAIN_STATUSES.indexOf(status) >= index;
              const colorSet = ORDER_STATUS_STYLES[item];

              return (
                <View style={styles.statusWrap} key={item}>
                  <View
                    style={[
                      styles.statusCont,
                      isActive && { backgroundColor: colorSet.bg },
                    ]}
                  >
                    <Ionicons
                      name={ICONS[item]}
                      color={isActive ? colorSet.text : "#ccc"}
                      size={20}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        isActive && { color: colorSet.text, fontWeight: "600" },
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                  {index !== MAIN_STATUSES.length - 1 && (
                    <View
                      style={[
                        styles.lineCont,
                        MAIN_STATUSES.indexOf(status) > index &&
                          styles.activeLine,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {MAIN_STATUSES.includes(status) ? (
          <ScrollView
            // style={styles.contentBox}
            showsVerticalScrollIndicator={false}
          >
            {status === "PENDING" && (
              <PendingContent
                order={orderData}
                isFollowUpOrder={isFollowUpOrder}
              />
            )}
            {status === "ACCEPTED" && (
              <AcceptedContent
                order={orderData}
                changeStatus={changeStatus}
                isFollowUpOrder={isFollowUpOrder}
              />
            )}
            {status === "COMING" && (
              <ComingContent
                order={orderData}
                changeStatus={changeStatus}
                isFollowUpOrder={isFollowUpOrder}
              />
            )}
            {status === "IN-PROGRESS" && (
              <InProgressContent
                order={orderData}
                changeStatus={changeStatus}
                isFollowUpOrder={isFollowUpOrder}
              />
            )}
          </ScrollView>
        ) : (
          <>
          <ScrollView showsVerticalScrollIndicator={false}>

            {status === "FINISHED" && (
              <FinishedContent
                order={orderData}
                // isFollowUpOrder={isFollowUpOrder}
              />
            )}
            {status === "INVOICED" && (
              <InvoicedContent
                order={orderData}
                // isFollowUpOrder={isFollowUpOrder}
              />
            )}
            {status === "CANCELLED" && (
              <CancelledContent
                order={orderData}
                // isFollowUpOrder={isFollowUpOrder}
              />
            )}
            {status === "DECLINED" && (
              <DeclinedContent
                order={orderData}
                // isFollowUpOrder={isFollowUpOrder}
              />
              )}
            </ScrollView>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: hp(4),
    paddingHorizontal: wp(4),
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusesCont: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(3),
  },
  statusWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusCont: {
    padding: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  statusText: {
    fontSize: wp(2.4),
    color: "#999",
  },
  lineCont: {
    backgroundColor: "#ccc",
    width: wp(9),
    height: hp(0.2),
    borderRadius: 10,
    marginHorizontal: wp(1),
  },
  activeLine: {
    backgroundColor: "black",
  },
  contentBox: {},
});
