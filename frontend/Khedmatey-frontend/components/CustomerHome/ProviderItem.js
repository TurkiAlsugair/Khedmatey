import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";

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
        <Text style={styles.imageText}>IMG</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.name}>{username}</Text>

        {/* placeholder rating */}
        <Text style={styles.rating}>Rating: 2.7</Text>
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
});
