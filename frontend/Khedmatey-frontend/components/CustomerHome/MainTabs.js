import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Easing,
} from "react-native";
import ServicesTab from "./ServicesTab";
import { Colors } from "../../constants/styles";
import ProvidersTab from "./ProvidersTab";

export default function TwoTabsAnimated({ city }) {
  const [activeTab, setActiveTab] = useState(0);

  const animatedValue = useRef(new Animated.Value(0)).current;

  const switchTab = (index) => {
    setActiveTab(index);
    Animated.timing(animatedValue, {
      toValue: index,
      duration: 320,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  // Slide the underline horizontally
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"], // or 0 to 100 in 'width' terms
  });

  return (
    <View style={styles.container}>
      {/* Tab Buttons */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={styles.tabButton} onPress={() => switchTab(0)}>
          <Text
            style={[styles.tabText, activeTab === 0 && styles.activeTabText]}
          >
            Services
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => switchTab(1)}>
          <Text
            style={[styles.tabText, activeTab === 1 && styles.activeTabText]}
          >
            Service Providers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Underline slider */}
      <View style={styles.sliderContainer}>
        <Animated.View
          style={[styles.slider, { transform: [{ translateX }] }]}
        />
      </View>

      {/* Actual Content */}
      <View style={styles.contentArea}>
        {activeTab === 0 ? (
          <ServicesTab city={city} />
        ) : (
          <ProvidersTab city={city} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.background,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 16,
    color: "#777",
  },
  activeTabText: {
    color: "#333",
    fontWeight: "bold",
  },
  sliderContainer: {
    height: 3,
    backgroundColor: "#eee",
    flexDirection: "row",
  },
  slider: {
    width: "50%", // 2 tabs => 50% each
    backgroundColor: Colors.secondary,
  },
  contentArea: {
    flex: 1,
  },
});
