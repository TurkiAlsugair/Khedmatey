import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";

export default function ProviderItem({ provider }) {
  // example fields from the sample
  const { username } = provider;
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ServiceProvider", { provider: provider })
      }
    >
      {/* Placeholder or real image */}
      <View style={styles.imagePlaceholder}>
      <Image
          style={[styles.image]}
          source={require("../../assets/images/serviceProvider.svg")}
          // placeholder={""}
          contentFit="contain"
          // transition={1000}
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.name}>{username}</Text>

        {/* placeholder rating */}
        <Text style={styles.rating}>Rating: {provider.avgRating?.toFixed(2) || "0.00"}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    // backgroundColor: "#fff",
    padding: 18,
    borderBottomWidth: 1,
    borderColor: "rgb(212, 212, 212)",
    flexDirection: "row",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    alignItems: "center",
  },
  imagePlaceholder: {
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
  infoSection: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  rating: {
    marginTop: 4,
    color: Colors.secondary,
    fontSize: 13,
  },
  image: {
    width: wp(15),
    height: hp(15),
  },
});
