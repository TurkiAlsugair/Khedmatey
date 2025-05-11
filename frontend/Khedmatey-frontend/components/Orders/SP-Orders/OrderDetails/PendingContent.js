import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors, ORDER_STATUS_STYLES } from "../../../../constants/styles";
import { Ionicons } from "@expo/vector-icons";
import Price from "../../../Price";
import { updateStatus } from "../../../../utility/order";
import { useContext } from "react";
import { AuthContext } from "../../../../context/AuthContext";

export default function PendingContent({ order, changeStatus, isFollowUpOrder = false }) {
  const [showPrevDetails, setShowPrevDetails] = useState(false);
  const { token } = useContext(AuthContext);
  const followUp = order.followUpService;
  const invoice = order.invoice;

  const calculateTotal = () => {
    if (!invoice?.details?.length) return 0;
    return invoice.details.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0
    );
  };

  const handleAccept = async () => {
    Alert.alert(
      "Accept Order",
      "Are you sure you want to accept this order?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await updateStatus(token, order.id, "ACCEPTED");
              changeStatus("ACCEPTED");
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to accept order. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleDecline = async () => {
    Alert.alert(
      "Decline Order",
      "Are you sure you want to decline this order?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await updateStatus(token, order.id, "DECLINED");
              changeStatus("DECLINED");
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to decline order. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.cont}>
      <Text style={{ color: "#666", textAlign: "center", marginBottom: hp(2) }}>
        New order request. You can accept or decline.
      </Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={handleDecline}
          style={[styles.actionButton, { backgroundColor: ORDER_STATUS_STYLES.DECLINED.text }]}
        >
          <Text style={styles.actionButtonText}>Decline Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAccept}
          style={[styles.actionButton, { backgroundColor: ORDER_STATUS_STYLES.ACCEPTED.text }]}
        >
          <Text style={styles.actionButtonText}>Accept Order</Text>
        </TouchableOpacity>
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
          <Text style={styles.bold}>Order ID:</Text> #{order.id}
        </Text>

        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Service:</Text>{" "}
          {isFollowUpOrder ? followUp?.nameEN : order.service?.nameEN}
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Description:</Text>{" "}
          {isFollowUpOrder ? followUp?.descriptionEN : order.service?.descriptionEN}
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Customer:</Text> {order.customer?.username}
        </Text>
        <Text style={styles.sectionText}>
          <Text style={styles.bold}>Phone Number:</Text>{" "}
          {order.customer?.phoneNumber}
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
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(3),
  },
  actionButton: {
    padding: hp(1.5),
    borderRadius: 8,
    alignItems: "center",
    width: "48%",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: wp(3.7),
    fontWeight: "bold",
  }
}); 