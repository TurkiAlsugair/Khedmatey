import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ORDER_STATUS_STYLES } from "../../../constants/styles";
import { Image } from "expo-image";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";

export default function ReceiptItem({ item }) {
  const { status, date, price } = item;
  const { text: textColor, bg: bgColor } = ORDER_STATUS_STYLES[status] || {
    text: "#777",
    bg: "#ededed",
  };

  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      // onPress={() => navigation.navigate("Order Details", { id: item.id })}
      onPress={() =>
        navigation.navigate("Previous Order", { orderId: item.id })
      }
    >
      {/* status badge */}
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>{status}</Text>
      </View>

      {/* provider, date, price */}
      <View style={styles.info}>
        <Text style={styles.title}>Order ID: #{item.id}</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={styles.priceCont}>
            <Text style={styles.price}>Price: </Text>
            <View>
              <Image
                style={styles.riyalLogo}
                source={require("../../../assets/images/SaudiRiyalSymbol.svg")}
                // placeholder={""}
                contentFit="contain"
                // transition={1000}
              />
            </View>
            <Text style={styles.price}>{price}</Text>
          </View>
          <Text style={styles.date}>{date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 6,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    gap: 7,
  },
  badge: {
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  badgeText: {
    fontSize: wp(3),
    fontWeight: "bold",
  },
  info: {
    padding: 12,
    gap: 10,
  },
  title: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  date: {
    fontSize: wp(3.4),
    color: "#666",
    // marginBottom: 4,
  },
  priceCont: {
    flexDirection: "row",
    alignItems: "center",
    // marginTop: 10,
  },
  price: {
    fontSize: wp(3.2),
    color: "#666",
  },
  riyalLogo: {
    width: wp(4),
    height: hp(1.3),
    // marginRight: wp(1),
    // backgroundColor: "red",
  },
});
