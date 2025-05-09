import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Colors } from "../../../constants/styles";

export default function CitiesRow({ data, activeCity, setActiveCity }) {
  // Extract unique city names from the data
  const getCityNames = () => {
    if (!data || !Array.isArray(data)) return [];
    
    const cities = data.map(cityGroup => cityGroup.city);
    return ["All", ...cities];
  };

  const cityList = getCityNames();

  return (
    <View style={styles.scrollCont}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {cityList.map((cityName) => {
          const isActive = cityName === activeCity;
          return (
            <TouchableOpacity
              key={cityName}
              style={[styles.chip, isActive && styles.activeChip]}
              onPress={() => setActiveCity(cityName)}
            >
              <Text
                style={[styles.chipText, isActive && styles.activeChipText]}
              >
                {cityName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollCont: {
    paddingVertical: 8,
    paddingLeft: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  chip: {
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    color: "#333",
    fontSize: wp(3.5),
  },
  activeChip: {
    borderBottomWidth: 2,
    borderColor: Colors.primary,
  },
  activeChipText: {
    fontWeight: "bold",
    color: Colors.primary,
  },
});
