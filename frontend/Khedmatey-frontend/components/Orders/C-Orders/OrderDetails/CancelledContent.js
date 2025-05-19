import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors, ORDER_STATUS_STYLES } from "../../../../constants/styles";
import { Ionicons } from "@expo/vector-icons";
import Price from "../../../Price";

export default function CancelledContent({ order, isFollowUpOrder = false }) {
  const [showPrevDetails, setShowPrevDetails] = useState(false);
  const followUp = order.followUpService;
  const invoice = order.invoice;
  const colors = ORDER_STATUS_STYLES["CANCELLED"];

  const calculateTotal = () => {
    if (!invoice?.details?.length) return 0;
    return invoice.details.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0
    );
  };

  return (
    <View style={styles.cont}>
      <View style={[styles.statusContainer, { backgroundColor: colors.bg }]}>
        <Text style={[styles.statusTitle, { color: colors.text }]}>
          Order Cancelled
        </Text>
        <Text style={styles.statusMessage}>
          This order has been cancelled and is no longer active.
        </Text>
      </View>

      <Text style={styles.title}>Order Details</Text>
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
          <Text style={styles.bold}>Order ID:</Text> #{order.id.substring(0, 7)}
        </Text>

        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Service:</Text>{" "}
          {isFollowUpOrder ? followUp?.nameEN : order.service?.nameEN}
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Description:</Text>{" "}
          {isFollowUpOrder ? followUp?.descriptionEN : order.service?.nameEN}
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Service Provider:</Text> {order.serviceProvider?.username}
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Address:</Text>{" "}
          {order.location?.fullAddress}
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Date:</Text> {order.date}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cont: {
    paddingBottom: hp(5),
  },
  statusContainer: {
    padding: 20,
    borderRadius: 8,
    marginBottom: hp(3),
  },
  statusTitle: {
    fontSize: wp(5.5),
    fontWeight: "bold",
    marginBottom: hp(1),
  },
  statusMessage: {
    fontSize: wp(4),
    color: "#444",
  },
  title: {
    fontSize: wp(5),
    fontWeight: "600",
    color: "black",
    marginBottom: 4,
    borderTopWidth: 0.2,
    borderColor: "#666",
    paddingTop: hp(2),
    borderRadius: 1,
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
  contentBox: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 0 },
    gap: hp(2.5),
  },
  sectionText: {
    fontSize: wp(3.5),
    color: "#333",
    paddingVertical: 4,
  },
  prevSectionText: {
    fontSize: wp(3.5),
    color: "#666",
    paddingVertical: 4,
  },
  bold: {
    fontWeight: "600",
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
    gap: hp(1),
  },
  invoiceRow: {
    borderBottomWidth: 0.2,
    borderColor: "#ccc",
    paddingBottom: hp(1),
  },
  totalRow: {
    marginTop: hp(1),
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
 