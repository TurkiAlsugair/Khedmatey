import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import ProviderItem from "../CustomerHome/ProviderItem";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export default function ProvidersResultsTab({ data }) {
  if (!data.length) {
    return (
      <View style={styles.empty}>
        <Text>No service providers found.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => item.id?.toString() || `provider-${index}`}
      renderItem={({ item }) => <ProviderItem provider={item} />}
      contentContainerStyle={{ paddingBottom: hp(16) }}
    />
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
});
