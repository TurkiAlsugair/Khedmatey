import React, { useContext } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Image } from "expo-image";

import IconButton from "../UI/IconButton";
import { Colors } from "../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useNavigation } from "@react-navigation/native";
import { ServicesContext } from "../../context/ServicesContext";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import Toast from "react-native-toast-message";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function ServiceItem({ service, editable }) {
  const navigation = useNavigation();
  const { activeCategoryId, deleteService } = useContext(ServicesContext);
  const { token } = useContext(AuthContext);

  const handleDelete = () => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to delete this service?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/service`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              deleteService(service.serviceId, activeCategoryId);
              Toast.show({
                type: "success",
                text1: "Service deleted",
                visibilityTime: 2000,
                topOffset: hp(7),
              });
            } catch (err) {
              Alert.alert("Error", "Failed to delete service.");
            }
          },
        },
      ]
    );
  };
  return (
    <View style={styles.card}>
      <View style={styles.infoSection}>
        <Text style={styles.name}>{service.nameEN}</Text>
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
      </View>
      {editable && (
        <View style={styles.actions}>
          <IconButton
            icon="create-outline"
            color={Colors.primary}
            size={20}
            onPress={() =>
              navigation.navigate("Update Service", {
                service,
              })
            }
          />
          <IconButton
            icon="trash-outline"
            color="red"
            size={20}
            onPress={handleDelete}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginBottom: 13,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoSection: {},
  name: {
    fontSize: wp(3.2),
    fontWeight: "600",
    width: wp(50),
  },
  priceCont: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
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
  actions: {
    flexDirection: "row",
    gap: 15,
    // justifyContent: "center",
    // marginTop: 10,
  },
});
