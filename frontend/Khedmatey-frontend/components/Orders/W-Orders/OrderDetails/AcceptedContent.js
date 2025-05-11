import { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Linking,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Button from "../../../UI/Button";
import { AuthContext } from "../../../../context/AuthContext";
import { Colors, ORDER_STATUS_STYLES } from "../../../../constants/styles";
import Price from "../../../Price";
import { updateStatus } from "../../../../utility/order";

export default function AcceptedContent({
  order,
  changeStatus,
  isFollowUpOrder = false,
}) {
  const { token } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isToday, setIsToday] = useState(false);
  const [showPrevDetails, setShowPrevDetails] = useState(false);

  const followUp = order.followUpService;
  const invoice = order.invoice;

  useEffect(() => {
    const today = new Date();
    const [day, month, year] = order.date.split("/").map(Number);
    const orderDate = new Date(year, month - 1, day);

    const isSameDate =
      today.getDate() === orderDate.getDate() &&
      today.getMonth() === orderDate.getMonth() &&
      today.getFullYear() === orderDate.getFullYear();

    setIsToday(isSameDate);
  }, [order.date]);

  const handleStartOrder = async () => {
    try {
      setIsLoading(true);
      await updateStatus(token, order.id, "COMING");
      changeStatus("COMING");
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsLoading(false);
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
        console.error("An error occurred", err)
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
      <Text style={{ color: "#666", textAlign: "center", marginBottom: hp(2) }}>
        The order has been accepted.
      </Text>

      <View style={styles.changeStatusCont}>
        <Text style={styles.changeStatusText}>
          Ready to Go? Change Status to Coming
        </Text>
        <Button
          onPress={handleStartOrder}
          disabled={!isToday}
          loading={isLoading}
        >
          Coming
        </Button>
        {!isToday && (
          <Text style={styles.notTodayText}>
            You can only start the order on {order.date}
          </Text>
        )}
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
          {isFollowUpOrder ? followUp?.descriptionEN : order.service?.nameEN}
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
  cont: {
    paddingBottom: hp(5),
  },
  title: {
    fontSize: wp(5),
    fontWeight: "600",
    color: "black",
    marginVertical: 4,
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
    gap: hp(2.5),
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
  bold: {
    fontWeight: "600",
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
  prevSectionText: {
    fontSize: wp(3.5),
    color: "#666",
    paddingVertical: 4,
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
  changeStatusCont: {
    marginVertical: hp(2),
  },
  changeStatusText: {
    color: "#666",
    marginBottom: hp(2),
  },
  notTodayText: {
    color: "#999",
    fontSize: wp(3),
    textAlign: "center",
    marginTop: 6,
  },
});
