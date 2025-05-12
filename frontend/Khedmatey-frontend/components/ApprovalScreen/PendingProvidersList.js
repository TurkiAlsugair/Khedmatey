import { useContext, useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { Colors } from "../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../context/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function PendingProvidersList() {
  const { token } = useContext(AuthContext);

  const [pendingProviders, setPendingProviders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // 🟢 Add a loading state

  useFocusEffect(
    useCallback(() => {
      const fetchPendingProviders = async () => {
        try {
          setLoading(true);
          const res = await axios.get(
            `${API_BASE_URL}/auth/admin/service-providers/status/pending`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setPendingProviders(res.data.data);
          setError("");
        } catch (err) {
          setError(err.response?.data?.message || "Could not fetch providers");
        } finally {
          setLoading(false);
        }
      };

      fetchPendingProviders();
    }, [token])
  );

  const handleAction = async (providerId, status) => {
    try {
      Alert.alert(
        "Confirmation",
        `Are you sure you want this provider to be ${status}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm",
            style: "default",
            onPress: async () => {
              await axios.patch(
                `${API_BASE_URL}/auth/admin/service-providers/${providerId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              Toast.show({
                type: "success",
                text1: `Provider ${status}!`,
                visibilityTime: 2000,
                topOffset: hp(7),
              });
              // remove from local list
              setPendingProviders((prev) =>
                prev.filter((p) => p.id !== providerId)
              );
            },
          },
        ]
      );
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.response?.data?.message || "Failed to update provider",
        visibilityTime: 2000,
        topOffset: hp(7),
      });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.titleText}>{item.username}</Text>
        <View style={styles.infoCont}>
          <Text style={styles.smallText}>
            <Text style={{ fontWeight: "bold" }}>Email:</Text> {item.email}
          </Text>
          <Text style={styles.smallText}>
            <Text style={{ fontWeight: "bold" }}>Phone number:</Text>{" "}
            {item.phoneNumber}
          </Text>
          <Text style={styles.smallText}>
            <Text style={{ fontWeight: "bold" }}>Cities:</Text>{" "}
            {item.cities?.join(", ")}
          </Text>
        </View>
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "green" }]}
          onPress={() => handleAction(item.id, "ACCEPTED")}
        >
          <Text style={styles.btnText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "red" }]}
          onPress={() => handleAction(item.id, "DECLINED")}
        >
          <Text style={styles.btnText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {pendingProviders.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending service providers</Text>
        </View>
      ) : (
        <FlatList
          data={pendingProviders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: hp(10) }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
  },
  emptyText: {
    fontSize: wp(4.2),
    color: "#888",
  },
  card: {
    padding: 12,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  infoCont: {
    gap: 3,
  },
  titleText: {
    fontSize: wp(4.7),
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 8,
  },
  smallText: {
    fontSize: wp(3.7),
    color: "#333",
    alignSelf: "flex-start",
  },
  btnRow: {
    alignSelf: "center",
    marginTop: 10,
    flexDirection: "row",
    gap: 15,
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
