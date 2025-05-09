import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";

export default function PreviousSearches({ list, onPress, onRemove, onClear }) {
  if (!list.length) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: "#666" }}>No previous searches.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Previous searches</Text>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearTxt}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 10 }}>
        {list.map((q) => (
          <TouchableOpacity
            key={q}
            style={styles.row}
            onPress={() => onPress(q)}
          >
            <Entypo
              name="back-in-time"
              size={18}
              color="#666"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.qTxt} numberOfLines={1}>
              {q}
            </Text>
            <TouchableOpacity
              onPress={() => onRemove(q)}
              style={{ marginLeft: "auto" }}
            >
              <Ionicons name="close" size={18} color="#666" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 25,
    paddingHorizontal: 15,
  },
  title: { fontSize: wp(4), fontWeight: "600" },
  clearTxt: { color: "#d00", fontWeight: "500" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "rgb(210, 210, 210)",
    padding: 15,
    gap: 10,
  },
  qTxt: { fontSize: wp(3.8), width: "80%", fontWeight: "500" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
});
