// admin/Drawers/ApprovalScreen.js
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import PendingProvidersList from "../../../components/ApprovalScreen/PendingProvidersList";
import PendingServicesProvidersList from "../../../components/ApprovalScreen/PendingServicesProvidersList";

export default function ApprovalScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("providers");
  // "providers" or "services"

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pendings need approval</Text>

      {/* Tabs */}
      <View style={styles.tabsCont}>
        <TouchableOpacity
          style={activeTab === "providers" ? styles.activeTabs : styles.tabs}
          onPress={() => setActiveTab("providers")}
        >
          <Text
            style={
              activeTab === "providers"
                ? styles.activeTabsText
                : styles.tabsText
            }
          >
            Service Providers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === "services" ? styles.activeTabs : styles.tabs}
          onPress={() => setActiveTab("services")}
        >
          <Text
            style={
              activeTab === "services" ? styles.activeTabsText : styles.tabsText
            }
          >
            Services
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conditionally Render */}
      {activeTab === "providers" ? (
        <PendingProvidersList />
      ) : (
        <PendingServicesProvidersList navigation={navigation} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: hp(5.5),
    paddingHorizontal: 20,
  },
  title: {
    fontSize: wp(6.5),
    fontWeight: "bold",
    alignSelf: "center",
    borderBottomColor: "black",
    borderBottomWidth: 2,
    paddingBottom: 4,
  },
  tabsCont: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: hp(3.5),
    alignSelf: "center",
    width: wp(100),
    marginBottom: hp(2.4),
  },
  tabs: {
    backgroundColor: "white",
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.primary,
    width: wp(37),
    alignItems: "center",
  },
  activeTabs: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderBottomWidth: 5,
    borderRadius: 10,
    borderColor: Colors.secondary,
    width: wp(37),
    alignItems: "center",
  },
  tabsText: {
    color: "black",
  },
  activeTabsText: {
    color: "white",
    fontWeight: "bold",
  },
});
