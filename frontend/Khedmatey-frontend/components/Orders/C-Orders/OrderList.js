/* components/orders/OrderList.js */
import React from "react";
import { FlatList, RefreshControl } from "react-native";
import OrderItem from "./OrderItem";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function OrderList({ data, refreshing, onRefresh }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <OrderItem order={item} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: hp(14) }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}
