import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AssignedItem from "./AssignedOrderItem";
import PreviousItem from "./PreviousOrderItem";
import CurrentItem from "./CurrentOrderItem";

export default function OrderList({ data, listType, refreshing, onRefresh }) {
  const renderItem = ({ item }) => {
    if (listType === "ASSIGNED") return <AssignedItem item={item} />;
    if (listType === "PREVIOUS") return <PreviousItem item={item} />;
    // current => we expect a single order object, but keep same API for FlatList
    return <CurrentItem order={item} />;
  };

  return (
    <FlatList
      data={Array.isArray(data) ? data : [data]} // current => maybe single obj
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: hp(15) }}
      ListEmptyComponent={() => (
        <View style={styles.center}>
          <Text style={{ color: "#666" }}>No orders found for {listType}.</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
});
