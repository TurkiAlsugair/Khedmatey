import { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Linking,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../../../context/AuthContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors, ORDER_STATUS_STYLES } from "../../../../constants/styles";
import Button from "../../../UI/Button";
import Price from "../../../Price";
import { updateStatus } from "../../../../utility/order";


export default function ComingContent({
  order,
  changeStatus,
  isFollowUpOrder,
}) {
  const { token } = useContext(AuthContext);
  const [loadingStatus, setLoadingStatus] = useState(null);
  const [showPrevDetails, setShowPrevDetails] = useState(false);

  const followUp = order.followUpService;
  const invoice = order.invoice;

  const updateStatusHandler = async (newStatus) => {
    try {
      setLoadingStatus(newStatus);
      await updateStatus(token, order.id, newStatus);
      changeStatus(newStatus);
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setLoadingStatus(null);
    }
  };

  const confirmCancel = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      { text: "Yes", onPress: () => updateStatusHandler("CANCELED") },
    ]);
  };

  const handleCall = () => {
    if (order.customer?.phoneNumber) {
      Linking.openURL(`tel:${order.customer.phoneNumber}`);
    }
  };

  const openInMaps = () => {
    const lat = order.location?.lat;
    const lng = order.location?.lng;
    const label = "Service Location";

    if (lat && lng) {
      const url =
        Platform.OS === "ios"
          ? `http://maps.apple.com/?ll=${lat},${lng}&q=${label}`
          : `geo:${lat},${lng}?q=${label}`;
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open map:", err)
      );
    }
  };

  const calculateTotal = () => {
    if (!invoice?.details?.length) return 0;
    return invoice.details.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0
    );
  };

  return (
    <View style={styles.cont}>
      <Text style={{ color: "#666", marginBottom: hp(2) }}>
        Once you arrive, call the customer. If no response, cancel the order.
      </Text>

      <View style={styles.changeStatusCont}>
        <Text style={styles.changeStatusText}>
          Ready to Work? Change Status to In Progress
        </Text>
        <View style={styles.buttonsCont}>
          <Button
            cusStyles={styles.cancelOrderButton}
            onPress={confirmCancel}
            disabled={loadingStatus === "CANCELED"}
            loading={loadingStatus === "CANCELED"}
          >
            Cancel
          </Button>
          <Button
            cusStyles={styles.InProgressOrderButton}
            onPress={() => updateStatusHandler("IN_PROGRESS")}
            disabled={loadingStatus === "IN_PROGRESS"}
            loading={loadingStatus === "IN_PROGRESS"}
          >
            In Progress
          </Button>
        </View>
      </View>

      <Text style={styles.orderDetailstitle}>Order Details</Text>
      <View style={styles.contentBox}>
        {isFollowUpOrder && (
          <Text style={styles.fuoTitle}>Follow-Up Order</Text>
        )}

        {isFollowUpOrder && (
          <TouchableOpacity
            onPress={() => setShowPrevDetails(!showPrevDetails)}
            style={styles.prevToggle}
          >
            <Text style={styles.prevToggleText}>Previous Order Details</Text>
            <Ionicons
              name={showPrevDetails ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.primary}
            />
          </TouchableOpacity>
        )}

        {showPrevDetails && invoice?.details?.length > 0 && (
          <View style={styles.prevDetailsBox}>
            {invoice.details.map((item, index) => (
              <View key={index} style={styles.invoiceRow}>
                <Text style={styles.prevSectionText}>
                  {item.nameEN} - {item.nameAR}
                </Text>
                <Price price={item.price} size={wp(3.5)} />
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.prevSectionText}>
                <Price price={calculateTotal()} size={wp(3.5)} header="Total" />
              </Text>
              <Text style={styles.prevSectionText}>
                <Text style={styles.bold}>Date:</Text> {invoice.date}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Service:</Text>{" "}
          {isFollowUpOrder ? followUp?.nameEN : order.service?.nameEN}
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Description:</Text>{" "}
          {isFollowUpOrder ? followUp?.descriptionEN : order.service?.nameEN}
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Customer:</Text> {order.customer?.username}
        </Text>

        <View style={styles.phoneRow}>
          <Text style={styles.sectionText}>
            <Text style={styles.bold}>Phone Number:</Text>{" "}
            {order.customer?.phoneNumber}
          </Text>
          <TouchableOpacity onPress={handleCall}>
            <Ionicons name="call" size={20} color={Colors.secondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Address:</Text>{" "}
          {order.location?.fullAddress}
        </Text>
        <TouchableOpacity onPress={openInMaps}>
          <Text style={styles.seeLocation}>See Location</Text>
        </TouchableOpacity>
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Date:</Text> {order.date}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cont: { paddingBottom: hp(5) },
  orderDetailstitle: {
    fontSize: wp(5),
    fontWeight: "600",
    color: "black",
    marginVertical: hp(2),
    borderTopWidth: 0.2,
    borderColor: "#666",
    paddingTop: hp(2),
  },
  contentBox: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 0 },
    gap: hp(2.2),
  },
  sectionText: {
    fontSize: wp(3.5),
    color: "#333",
    paddingVertical: 4,
  },
  seeLocation: {
    fontSize: wp(3.5),
    color: Colors.secondary,
    textDecorationLine: "underline",
    marginTop: -5,
  },
  prevSectionText: {
    fontSize: wp(3.5),
    color: "#666",
    paddingVertical: 4,
  },
  bold: {
    fontWeight: "600",
  },
  changeStatusCont: {
    marginTop: hp(2),
  },
  changeStatusText: {
    color: "#666",
    marginBottom: hp(2),
  },
  buttonsCont: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  InProgressOrderButton: {
    width: "68%",
  },
  cancelOrderButton: {
    backgroundColor: "rgba(224, 1, 1, 0.71)",
    width: "30%",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fuoTitle: {
    textAlign: "center",
    backgroundColor: ORDER_STATUS_STYLES["FINISHED"].bg,
    color: ORDER_STATUS_STYLES["FINISHED"].text,
    padding: 10,
    fontWeight: "bold",
    borderRadius: 8,
    fontSize: wp(3.7),
  },
  prevToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingBottom: 4,
  },
  prevToggleText: {
    color: Colors.primary,
    fontSize: wp(3.5),
    fontWeight: "500",
  },
  prevDetailsBox: {
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
    gap: hp(1),
  },
  invoiceRow: {
    borderBottomWidth: 0.2,
    borderColor: "#ccc",
    paddingBottom: hp(1),
  },
  totalRow: {
    marginTop: hp(1.2),
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
