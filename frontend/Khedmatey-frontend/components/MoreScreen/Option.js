import { Pressable, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";

export default function Option({
  optionText,
  optionIcon,
  otherIcon,
  optionIconSize = 20,
  optionIconColor = Colors.primary,
  optionTextColor = "black",
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressed, // adds visual feedback
      ]}
    >
      <View style={styles.optionCont}>
        <View style={styles.cont1}>
          <View>
            <Ionicons
              name={optionIcon}
              color={optionIconColor}
              size={optionIconSize}
            />
          </View>
          <Text style={[styles.optionText, { color: optionTextColor }]}>
            {optionText}
          </Text>
        </View>
        <View>
          <Ionicons name={otherIcon} color={optionIconColor} size={20} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    // Optional: can leave empty or add border radius if needed
  },
  pressed: {
    opacity: 0.6, // slight dim when pressed
    backgroundColor: "#f0f0f0", // light feedback color
  },
  optionCont: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#dddddd",
  },
  cont1: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(5), // optional for spacing
    // flexShrink: 1, // allow shrinking if needed
  },

  optionText: {
    fontSize: wp(4.5),
    // flexShrink: 1, // allow text to wrap only if necessary
  },
});
