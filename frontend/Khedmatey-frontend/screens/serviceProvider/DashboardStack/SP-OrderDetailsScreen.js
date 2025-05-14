import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useEffect, useState, useContext } from "react";
import socket from "../../../utility/socket";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ORDER_STATUS_STYLES } from "../../../constants/styles";
import { fetchOrderDetails } from "../../../utility/order";
import { AuthContext } from "../../../context/AuthContext";

// Main status components
import PendingContent from "../../../components/Orders/SP-Orders/OrderDetails/PendingContent";
import AcceptedContent from "../../../components/Orders/SP-Orders/OrderDetails/AcceptedContent";
import ComingContent from "../../../components/Orders/SP-Orders/OrderDetails/ComingContent";
import InProgressContent from "../../../components/Orders/SP-Orders/OrderDetails/InProgressContent";

// Final status components
import FinishedContent from "../../../components/Orders/SP-Orders/OrderDetails/FinishedContent";
import InvoicedContent from "../../../components/Orders/SP-Orders/OrderDetails/InvoicedContent";
import CanceledContent from "../../../components/Orders/SP-Orders/OrderDetails/CanceledContent";
import DeclinedContent from "../../../components/Orders/SP-Orders/OrderDetails/DeclinedContent";

const MAIN_STATUSES = ["PENDING", "ACCEPTED", "COMING", "IN_PROGRESS"];
const FINAL_STATUSES = ["FINISHED", "INVOICED", "CANCELED", "DECLINED"];

const ICONS = {
  PENDING: "time-outline",
  ACCEPTED: "checkmark-circle-outline",
  COMING: "car-outline",
  "IN_PROGRESS": "hammer-outline",
};

export default function OrderDetailsScreen({ navigation, route }) {
  const { order, orderStatus } = route.params;
  const id = order.id;
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
    socket.emit("joinOrderRoom", { orderId: id });

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
          <ScrollView showsVerticalScrollIndicator={false}>
            {status === "PENDING" && (
              <PendingContent
                order={orderData}
                changeStatus={changeStatus}
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
                isFollowUpOrder={isFollowUpOrder}
              />
            )}
            {status === "IN_PROGRESS" && (
              <InProgressContent
                order={orderData}
                isFollowUpOrder={isFollowUpOrder}
              />
            )}
          </ScrollView>
        ) : (
          <>
          <ScrollView showsVerticalScrollIndicator={false}>

            {status === "FINISHED" && (
              <FinishedContent order={orderData} isFollowUpOrder={isFollowUpOrder} changeStatus={changeStatus}/>
            )}
            {status === "INVOICED" && (
              <InvoicedContent order={orderData} isFollowUpOrder={isFollowUpOrder}/>
            )}
            {status === "CANCELED" && (
              <CanceledContent order={orderData} isFollowUpOrder={isFollowUpOrder}/>
            )}
            {status === "DECLINED" && (
              <DeclinedContent order={orderData} isFollowUpOrder={isFollowUpOrder}/>
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
});
