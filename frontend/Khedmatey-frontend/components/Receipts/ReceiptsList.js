import React from "react";
import { FlatList, RefreshControl, View, Text } from "react-native";
import ReceiptItem from "./ReceiptsItem";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function ReceiptList({ data, refreshing, onRefresh }) {
  if (!data.length) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <Text>No receipts to show.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <ReceiptItem receipt={item} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: hp(14) }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}
