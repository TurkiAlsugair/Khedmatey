// components/CategoriesRow.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { serviceCategories } from "../../constants/data";
import { Colors } from "../../constants/styles";

export default function CategoriesRow({
  categories,
  activeCategory,
  setActiveCategory,
}) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => {
          const isActive = cat.value === activeCategory;
          return (
            <TouchableOpacity
              key={cat.value}
              style={[styles.chip, isActive && styles.activeChip]}
              onPress={() => setActiveCategory(cat.value)}
            >
              <Text
                style={[styles.chipText, isActive && styles.activeChipText]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // some styling for the row
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 10,
    // backgroundColor: "#f0f0f0",
  },
  chip: {
    backgroundColor: "#fff",
    marginHorizontal: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  chipText: {
    color: "#333",
  },
  activeChip: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  activeChipText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
