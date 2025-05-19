// components/ServiceItem.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";

import { Colors } from "../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";

export default function ServiceItem({ service, showProvider = true }) {
  const { nameEN, price, category, serviceProvider } = service;
  // category = {id, name}
  // serviceProvider = {id, username, phoneNumber, email, ...}
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("PickAppointment", { service: service })
      }
    >
      {/* Placeholder or real image */}
      <View style={styles.imagePlaceholder}>
      <Image
          style={[styles.image]}
          source={require("../../assets/images/service.svg")}
          // placeholder={""}
          contentFit="contain"
          // transition={1000}
        />
      </View>
      <View style={styles.infoCont}>
        <Text style={styles.name}>{nameEN}</Text>
        <Text style={styles.category}>Category: {category?.name || "N/A"}</Text>
        <View style={styles.priceCont}>
          <Text style={styles.price}>Price: </Text>

          {service.price !== "TBD" ? (
            <View>
              <Image
                style={styles.riyalLogo}
                source={require("../../assets/images/SaudiRiyalSymbol.svg")}
                // placeholder={""}
                contentFit="contain"
                // transition={1000}
              />
            </View>
          ) : null}
          <Text style={styles.price}>{service.price}</Text>
        </View>
        {showProvider && (
          <Text style={styles.provider}>
            Service Provider: {serviceProvider?.username}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    gap: hp(1),
    flexDirection: "row",
    alignItems: "center",
  },
  infoCont: {
    gap: hp(1),
  },
  imagePlaceholder: {
    backgroundColor: "green",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  imageText: {
    color: "#fff",
    fontWeight: "bold",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  category: {
    fontSize: 14,
    marginTop: 4,
    color: "#555",
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

  provider: {
    fontSize: 13,
    marginTop: 2,
    color: "#666",
  },
  image: {
    width: wp(15),
    height: hp(15),
  },
});
