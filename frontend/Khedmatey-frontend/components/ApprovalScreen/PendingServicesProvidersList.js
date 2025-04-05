import { useContext, useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { Colors } from "../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AuthContext } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function PendingServicesProvidersList({ navigation }) {
  const { token } = useContext(AuthContext);

  const [providers, setProviders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchPendingServices = async () => {
        try {
          setLoading(true);
          const res = await axios.get(
            `${API_BASE_URL}/admin/providers/pending-services`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setProviders(res.data.data);
          setError("");
        } catch (err) {
          setError(
            err.response?.data?.message || "Could not fetch pending services"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchPendingServices();
    }, [token])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        // We do not pop automatically
        navigation.navigate("PendingServices", {
          provider: item,
        })
      }
    >
      <View>
        <Text style={styles.titleText}>{item.username}</Text>
        <Text style={styles.smallText}>
          <Text style={{ fontWeight: "bold" }}>Email: </Text>
          {item.email}
        </Text>
        <Text style={styles.smallText}>
          <Text style={{ fontWeight: "bold" }}>Phone number: </Text>
          {item.phoneNumber}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward-outline"
        color={Colors.primary}
        size={20}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingBottom: hp(5) }}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {providers.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No providers have pending services
          </Text>
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
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
  titleText: { fontSize: wp(4.7), fontWeight: "bold", marginBottom: hp(1.2) },
  smallText: { fontSize: wp(3.2), color: "#333", marginBottom: hp(0.5) },
});
