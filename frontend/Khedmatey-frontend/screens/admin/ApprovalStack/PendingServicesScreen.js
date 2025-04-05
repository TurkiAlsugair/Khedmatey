import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../../context/AuthContext";
import IconButton from "../../../components/UI/IconButton";
import { Image } from "expo-image";
import { getCategoryNameById } from "../../../utility/services";
import { Colors } from "../../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function PendingServicesScreen({ route, navigation }) {
  const { token } = useContext(AuthContext);
  const { provider } = route.params; // no refreshFn
  const [pendingServices, setPendingServices] = useState([]);

  useEffect(() => {
    setPendingServices(provider.pendingServices || []);
  }, [provider]);

  const handleAction = async (serviceId, status) => {
    Alert.alert(
      "Confirmation",
      `Are you sure you want this service to be ${status}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "default",
          onPress: async () => {
            try {
              await axios.patch(
                `${API_BASE_URL}/admin/service-providers/${provider.id}/services/${serviceId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              Toast.show({
                type: "success",
                text1: `Service ${status}!`,
                visibilityTime: 2000,
                topOffset: hp(7),
              });
              // remove from local state
              setPendingServices((prev) => {
                const updated = prev.filter(
                  (svc) => svc.serviceId !== serviceId
                );
                if (updated.length === 0) {
                  // If no more services left, pop back
                  navigation.goBack();
                }
                return updated;
              });
            } catch (err) {
              Toast.show({
                type: "error",
                text1: "Error",
                text2:
                  err.response?.data?.message || "Failed to update service",
                visibilityTime: 2000,
                topOffset: hp(7),
              });
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <View style={styles.titleCont}>
          <Text style={styles.titleText}>
            {getCategoryNameById(item.categoryId)}
          </Text>
        </View>
        <Text style={styles.smallText}>
          <Text style={{ fontWeight: "bold" }}>English Description: </Text>
          {item.nameEN}
        </Text>
        <Text style={styles.smallText}>
          <Text style={{ fontWeight: "bold" }}>Arabic Description: </Text>
          {item.nameAR}
        </Text>
        <View style={styles.priceCont}>
          <Text style={styles.smallText}>
            <Text style={{ fontWeight: "bold" }}>Price: </Text>
          </Text>
          {item.price !== "TBD" && (
            <Image
              style={styles.riyalLogo}
              source={require("../../../assets/images/SaudiRiyalSymbol.svg")}
              contentFit="contain"
            />
          )}
          <Text style={styles.smallText}> {item.price}</Text>
        </View>
      </View>
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "green" }]}
          onPress={() => handleAction(item.serviceId, "ACCEPTED")}
        >
          <Text style={styles.btnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "red" }]}
          onPress={() => handleAction(item.serviceId, "DECLINED")}
        >
          <Text style={styles.btnText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <IconButton
        color="black"
        size={30}
        icon="arrow-back"
        onPress={() => navigation.goBack()}
      />
      <Text style={styles.providerName}>
        {provider.username}'s Pending Services
      </Text>
      <FlatList
        data={pendingServices}
        keyExtractor={(item) => item.serviceId}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Colors.background },
  providerName: {
    fontSize: wp(5),
    fontWeight: "bold",
    marginVertical: hp(2),
    textAlign: "center",
  },
  card: {
    padding: 12,
    marginBottom: 24,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  titleCont: {
    elevation: 3,
    shadowColor: "black",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 1 },
  },
  titleText: {
    fontSize: wp(3.8),
    fontWeight: "bold",
    alignSelf: "center",
    backgroundColor: Colors.secondary,
    color: "white",
    padding: 7,
    borderRadius: 10,
  },
  smallText: {
    fontSize: wp(3.6),
    color: "#333",
    marginTop: hp(1),
  },
  priceCont: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: hp(0.5),
  },
  riyalLogo: {
    width: wp(4),
    height: hp(1.3),
  },
  btnRow: {
    alignSelf: "center",
    marginTop: hp(2),
    flexDirection: "row",
    gap: wp(4),
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});
