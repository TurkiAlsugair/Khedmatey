// InProgressContent.js
import { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Price from "../../../Price";
import Button from "../../../UI/Button";
import { Colors, ORDER_STATUS_STYLES } from "../../../../constants/styles";
import { AuthContext } from "../../../../context/AuthContext";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import GenerateInvoiceModal from "../../../Modals/GenerateInvoiceModal";
import axios from "axios";
import Toast from "react-native-toast-message";
import { updateStatus } from "../../../../utility/order";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

// Invoice means: Current Generated Invoice and order.Invoice means: Previous Generated Invoice
export default function InProgressContent({
  order,
  changeStatus,
  isFollowUpOrder = false,
}) {
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);

  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showPrevDetails, setShowPrevDetails] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [isFollowUp, setIsFollowUp] = useState(false);

  console.log(`${JSON.stringify({ ...invoice })} kk`);

  const renderPreviousDetailsBox = () => {
    const details = order.invoice?.details || [];
    const total = details.reduce(
      (acc, item) => acc + parseFloat(item.price),
      0
    );

    return (
      <View style={styles.prevDetailsBox}>
        {details.map((item, idx) => (
          <View key={idx} style={styles.invoiceRow}>
            <Text style={styles.prevSectionText}>
              {item.nameEN} - {item.nameAR}
            </Text>
            <Price price={item.price} size={wp(3.5)} />
          </View>
        ))}
        <View style={styles.bottomSummaryRow}>
          <Text style={styles.prevSectionText}>
            <Price price={total.toFixed(2)} size={wp(3.5)} header="Total" />
          </Text>
          <Text style={styles.prevSectionText}>
            <Text style={styles.bold}>Date:</Text> {order.invoice?.date}
          </Text>
        </View>
      </View>
    );
  };

  const handleEndOrder = async () => {
    if (!invoice) {
      Toast.show({
        type: "error",
        text1: "Please generate an invoice first.",
        visibilityTime: 2000,
        topOffset: hp(7),
      });
      return;
    }
    Alert.alert(
      "Confirm",
      "Are you sure you want to end this order?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              // 1. Send invoice (POST for normal, PATCH for follow-up)
              if (!isFollowUpOrder) {
                await axios.post(
                  `${API_BASE_URL}/generateInvoice`,
                  { orderId: order.id, ...invoice },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              } else {
                await axios.patch(
                  `${API_BASE_URL}/generateInvoice`,
                  { orderId: order.id, ...invoice },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              }
              console.log(...invoice);
              // 2. Update order status to INVOICED using shared method
              await updateStatus(token, order.id, "INVOICED");
              changeStatus("INVOICED");
              Toast.show({
                type: "success",
                text1: "Order invoiced successfully!",
                visibilityTime: 2000,
                topOffset: hp(7),
              });
            } catch (err) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: err.response?.data?.message || "Failed to invoice order.",
                visibilityTime: 2000,
                topOffset: hp(7),
              });
            }
          },
        },
      ]
    );
  };

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes", 
          style: "default",
          onPress: async () => {
            try {
              await updateStatus(token, order.id, "CANCELLED");
              changeStatus("CANCELLED");
              Toast.show({
                type: "success",
                text1: "Order cancelled successfully",
                visibilityTime: 2000,
                topOffset: hp(7),
              });
            } catch (err) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: err.response?.data?.message || "Failed to cancel order.",
                visibilityTime: 2000,
                topOffset: hp(7),
              });
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.cont}>
      <Text style={styles.topText}>Finished? Generate an Invoice Below.</Text>

      {/* Order Details Toggle */}
      <TouchableOpacity
        onPress={() => setShowOrderDetails(!showOrderDetails)}
        style={styles.detailsToggle}
      >
        <Text style={styles.title}>Order Details</Text>
        <Ionicons
          name={
            showOrderDetails ? "chevron-up-outline" : "chevron-down-outline"
          }
          color={Colors.secondary}
          size={25}
        />
      </TouchableOpacity>

      {showOrderDetails && (
        <View style={styles.contentBox}>
          {isFollowUpOrder && (
            <Text style={styles.fuoLabel}>Follow-Up Order</Text>
          )}

          {isFollowUpOrder && (
            <>
              <TouchableOpacity
                onPress={() => setShowPrevDetails(!showPrevDetails)}
                style={styles.prevToggle}
              >
                <Text style={styles.prevToggleText}>
                  Previous Order Details
                </Text>
                <Ionicons
                  name={showPrevDetails ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              {showPrevDetails && renderPreviousDetailsBox()}
            </>
          )}

          <Text style={styles.sectionText}>
            <Text style={styles.bold}>Order ID:</Text> #{order.id}
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.bold}>Service:</Text>{" "}
            {isFollowUpOrder
              ? order.followUpService?.nameEN
              : order.service?.nameEN}
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.bold}>Description:</Text>{" "}
            {isFollowUpOrder
              ? order.followUpService?.descriptionEN
              : order.service?.nameEN}
          </Text>
          <Text style={styles.sectionText}>
            <Text style={styles.bold}>Customer:</Text>{" "}
            {order.customer?.username}
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
      )}

      {/* Generate Invoice */}
      <Text style={styles.titleGenerate}>Generate Invoice</Text>
      <Button
        cusStyles={[
          styles.invoiceButton,
          invoice && { backgroundColor: "#33aa33" },
        ]}
        onPress={() => setModalVisible(true)}
      >
        {invoice ? "Edit Invoice" : "Generate Invoice"}
      </Button>

      {invoice && (
        <View style={styles.contentBox}>
          <Text style={styles.title}>Invoice Details</Text>
          {invoice.details.map((item, index) => (
            <View key={index} style={styles.invoiceRow}>
              <Text style={styles.sectionText}>
                {item.nameEN} - {item.nameAR}
              </Text>
              <Price price={item.price} size={wp(3.5)} />
            </View>
          ))}
          <View style={styles.bottomSummaryRow}>
            <Text style={styles.sectionText}>
              <Price
                price={invoice.details
                  .reduce((acc, item) => acc + parseFloat(item.price), 0)
                  .toFixed(2)}
                size={wp(3.5)}
                header="Total"
              />
            </Text>
            <Text style={styles.sectionText}>
              <Text style={styles.bold}>Date:</Text>{" "}
              {invoice.date}
            </Text>
          </View>
        </View>
      )}

      {invoice && (
        <View style={{ marginTop: hp(2) }}>
          {!isFollowUpOrder && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text style={{ fontSize: wp(4.2) }}>Follow-Up Service?</Text>
              <Switch
                value={isFollowUp}
                onValueChange={setIsFollowUp}
                trackColor={{ true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>
          )}
          <Button
            onPress={() => {
              if (!isFollowUpOrder && isFollowUp) {
                navigation.navigate("Follow-Up Service", {
                  order,
                  invoice,
                  onFinished: () => changeStatus("FINISHED"),
                });
              } else {
                handleEndOrder();
              }
            }}
            cusStyles={{ marginTop: hp(2) }}
          >
            {isFollowUp ? "Send Follow-Up Order" : "End Order"}
          </Button>
        </View>
      )}

      {/* Cancel Order Button */}
      <Button 
        onPress={handleCancelOrder} 
        cusStyles={[styles.cancelButton, !invoice && {     width: wp(45)        }]}
      >
        Cancel Order
      </Button>

      <GenerateInvoiceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(inv) => setInvoice(inv)}
        invoice={invoice}
        isFollowUpOrder={isFollowUpOrder}
        previousInvoice={order.invoice}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cont: { paddingBottom: hp(5) },
  topText: {
    color: "#666",
    textAlign: "center",
    marginBottom: hp(2),
    borderBottomWidth: 0.2,
    borderColor: "#666",
    paddingBottom: hp(2),
  },
  title: {
    fontSize: wp(5),
    fontWeight: "600",
    color: "black",
  },
  titleGenerate: {
    fontSize: wp(5),
    fontWeight: "600",
    color: "black",
    marginVertical: hp(2),
  },
  detailsToggle: {
    flexDirection: "row",
    gap: wp(1.4),
    alignItems: "center",
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
    marginVertical: hp(2),
  },
  sectionText: {
    fontSize: wp(3.5),
    color: "#666",
    paddingVertical: 4,
  },
  prevSectionText: {
    fontSize: wp(3.5),
    color: "#666",
    paddingVertical: 4,
  },
  bold: {
    fontWeight: "bold",
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
  },
  invoiceButton: {
    width: wp(45) 
  },
  cancelButton: {
    backgroundColor: "#ff4d4d",
    marginTop: hp(3),
  },
  fuoLabel: {
    textAlign: "center",
    backgroundColor: ORDER_STATUS_STYLES["FINISHED"].bg,
    color: ORDER_STATUS_STYLES["FINISHED"].text,
    padding: 10,
    fontWeight: "bold",
    borderRadius: 8,
    fontSize: wp(3.7),
    marginBottom: hp(1),
  },
  invoiceRow: {
    borderBottomWidth: 0.2,
    borderColor: "#ccc",
    paddingBottom: hp(1),
  },
  bottomSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp(1),
  },
});
