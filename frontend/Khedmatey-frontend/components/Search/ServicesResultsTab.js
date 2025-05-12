// components/Search/ServicesResultsTab.js
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Switch, // ← NEW
} from "react-native";
import ServiceItem from "../CustomerHome/ServiceItem";
import { Colors } from "../../constants/styles";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

export default function ServicesResultsTab({ data = [] }) {
  /* by default NOT sorted */
  const [byPrice, setByPrice] = useState(false);

  /* memo‑compute the list whenever toggle or data changes */
  const list = useMemo(() => {
    if (!byPrice) return data;

    /* helper: convert "TBD" → +Infinity, otherwise Number(str) */
    const parse = (p) => (p === "TBD" ? Number.POSITIVE_INFINITY : +p);

    return [...data].sort((a, b) => parse(a.price) - parse(b.price));
  }, [byPrice, data]);

  /* empty */
  if (!list.length)
    return (
      <View style={styles.empty}>
        <Text>No services found.</Text>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      {/* ─── price switch ─── */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Filter By Lowest Price</Text>
        <Switch
          value={byPrice}
          onValueChange={setByPrice}
          trackColor={{ true: Colors.secondary }}
          thumbColor="#fff"
        />
      </View>

      <FlatList
        data={list}
        // item.id if the response changed to id instead of serviceId
        keyExtractor={(item, index) => item.serviceId?.toString() || `service-${index}`}
        renderItem={({ item }) => (
          <ServiceItem service={item} showProvider={false} />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      />
    </View>
  );
}

/* styles */
const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", marginTop: 60 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "rgb(220,220,220)",
    backgroundColor: Colors.background,
  },
  switchLabel: { fontSize: wp(3.6), color: "", fontWeight: "500" },
});
