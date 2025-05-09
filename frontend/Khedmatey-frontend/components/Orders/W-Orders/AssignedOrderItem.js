import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, ORDER_STATUS_STYLES } from "../../../constants/styles";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";

export default function OrderItem({ item }) {
  const { status, id, date } = item;

  // fall‑back colours if an unknown status sneaks in
  const { text: textColor, bg: bgColor } = ORDER_STATUS_STYLES[status] || {
    text: "#777",
    bg: "#ededed",
  };

  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("Order Details", {
          id: item.id,
          orderStatus: status,
        })
      }
    >
      {/* provider + date */}
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.title}>Order ID: #{id}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <View
        style={[
          styles.chip,
          { backgroundColor: bgColor, borderColor: textColor },
        ]}
      >
        <Text style={[styles.chipText, { color: textColor }]}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
  },

  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  chipText: {
    fontSize: wp(3),
    fontWeight: "bold",
    textAlign: "center",
  },

  title: {
    fontSize: wp(3.8),
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 4,
  },
  date: {
    fontSize: wp(3.4),
    color: "#555",
  },
  followupText: {
    fontSize: wp(3.2),
    color: Colors.accent,
    marginTop: 6,
    fontWeight: "500",
  },
});
