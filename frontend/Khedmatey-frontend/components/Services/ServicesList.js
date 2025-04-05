// components/Services/ServicesList.js
import React, { useContext } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import ServiceItem from "./ServiceItem";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function ServicesList({ services, editable }) {
  return (
    <View style={styles.listCont}>
      <ScrollView>
        {services.map((service) => (
          <ServiceItem
            key={service.serviceId}
            service={service}
            editable={editable}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  listCont: {
    marginTop: hp(0.7),
    gap: 10,
    height: hp(52),
  },
});
