import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { LocationContext } from "../../../context/LocationContext";
import LocationFallBack from "../../../components/CustomerHomeTab/LocationFallBack";
import IconButton from "../../../components/UI/IconButton";
import { Colors } from "../../../constants/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import MainTabs from "../../../components/CustomerHome/MainTabs";

export default function HomeScreen({ navigation }) {
  const { location, locationLoading } = useContext(LocationContext);
  const insets = useSafeAreaInsets();

  if (locationLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!location) {
    return <LocationFallBack />;
  }

  return (
    <>
      <StatusBar barStyle={"light-content"} />
      <View style={styles.container}>
        <View style={[styles.headerCont, { paddingTop: insets.top + hp(1.5) }]}>
          <View style={styles.headerP1}>
            <Text style={styles.logoText}>Khedmatey</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("PickFromMap")}
              style={styles.headerTitleCont}
            >
              <Ionicons name="chevron-down-outline" size={20} color="white" />
              <Text style={styles.addressText}>{location.city}</Text>
              <Ionicons name="location" size={23} color="white" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <View style={styles.SearchCont}>
              <Ionicons name="search" color="rgb(142, 142, 142)" size={17} />
              <Text style={styles.searchText}>Search...</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Here put location.city instead of Riyadh */}
        <MainTabs city={"Riyadh"} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCont: { backgroundColor: Colors.primary, padding: 20 },
  headerP1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleCont: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  addressText: {
    fontSize: wp(3.2),
    color: "white",
    fontWeight: "bold",
  },
  logoText: {
    color: "white",
    fontSize: wp(5),
    fontWeight: "bold",
  },
  SearchCont: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 7,
    backgroundColor: Colors.background,
    borderRadius: 7,
    marginTop: hp(1),
  },
  searchText: {
    color: "rgb(142, 142, 142)",
    fontSize: 14,
  },
});
