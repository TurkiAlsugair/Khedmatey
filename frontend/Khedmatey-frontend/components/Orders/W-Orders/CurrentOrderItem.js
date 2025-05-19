import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Colors, ORDER_STATUS_STYLES } from "../../../constants/styles";
import { useNavigation } from "@react-navigation/native";

export default function CurrentItem({ order }) {
  const { text: textColor, bg: bgColor } = ORDER_STATUS_STYLES[
    order.status
  ] || {
    text: "#777",
    bg: "#ededed",
  };
  const navigation = useNavigation();
  return (
    <View style={styles.cont}>
      <View
        style={[
          styles.chip,
          { backgroundColor: bgColor, borderColor: textColor },
        ]}
      >
        <Text style={[styles.chipText, { color: textColor }]}>
          Status: {order.status}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("Order Details", {
            id: order.id,
            orderStatus: order.status,
          })
        }
      >
        <Text style={[styles.title, { marginBottom: 6 }]}>
          Current Order #{order.id.substring(0, 7)}
        </Text>

        {/* service */}
        <Text style={styles.row}>{order.service?.nameEN}</Text>

        {/* meta */}
        <Text style={styles.row}>Customer: {order.customer?.username}</Text>
        <Text style={styles.row}>
          Phone Number: {order.customer?.phoneNumber}
        </Text>
        <Text style={styles.row}>Date: {order.date}</Text>
      </TouchableOpacity>
      <View>
        <Text>Instructions: ....</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cont: {
    flex: 1,
    gap: 10,
  },
  chip: {
    padding: 12,
    borderRadius: 4,
  },
  chipText: {
    fontSize: wp(4),
    fontWeight: "bold",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginVertical: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    gap: 10,
  },
  title: {
    fontSize: wp(4),
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
  },
  row: { fontSize: wp(3.4), color: "#555", marginTop: 2 },
});
