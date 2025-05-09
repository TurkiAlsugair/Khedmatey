import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, ORDER_STATUS_STYLES } from "../../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";

export default function OrderItem({ request, status }) {
  const navigation = useNavigation();
  
  // Get status colors from the constants
  const statusColors = ORDER_STATUS_STYLES[status] || {
    bg: "#ccc",
    text: "#666"
  };
  
  const handlePress = () => {
    if (status === "INVOICED" || status === "PAID") {
      navigation.navigate("PreviousOrders", { request, status });
    } else {
      navigation.navigate("OrderDetails", { order: request, orderStatus:status });
    }
  };

  const isFollowUp = !!request.followUpService;

  // Determine which service name to display
  const serviceName = isFollowUp 
    ? request.followUpService.nameEN 
    : request.service.nameEN;

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View
        style={[
          styles.statusIndicator,
          { backgroundColor: statusColors.text }
        ]}
      />
      <View style={styles.infoCont}>
        <Text style={styles.serviceName}>{serviceName}</Text>
        <Text style={styles.metaText}>City: {request.location?.city}</Text>
        <Text style={styles.metaText}>Address: {request.location?.miniAddress}</Text>
        <Text style={styles.metaText}>Date: {request.date}</Text>
        {isFollowUp && (
          <View style={styles.followUpBadge}>
            <Text style={styles.followUpText}>Follow-up Service</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    flexDirection: "column",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    position: "relative",
  },
  infoCont: {
    flex: 1,
    gap: 7,
  },
  serviceName: {
    fontSize: wp(4),
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 5,
  },
  metaText: {
    fontSize: wp(3.5),
    color: "#666",
  },
  statusIndicator: {
    width: 17,
    height: 17,
    borderBottomLeftRadius: 6,
    borderTopRightRadius: 6,
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
  },
  followUpBadge: {
    marginTop: 4,
    backgroundColor: ORDER_STATUS_STYLES.FINISHED.bg,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  followUpText: {
    fontSize: wp(3),
    color: ORDER_STATUS_STYLES.FINISHED.text,
    fontWeight: '500',
  }
});
