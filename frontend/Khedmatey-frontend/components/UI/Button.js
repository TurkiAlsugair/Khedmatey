import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../../constants/styles";

function Button({
  children,
  onPress,
  cusStyles,
  cusText,
  disabled = false,
  loading = false,
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        cusStyles,
        isDisabled ? styles.buttonDisabled : pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text
            style={[
              styles.buttonText,
              cusText,
              isDisabled && styles.textDisabled,
            ]}
          >
            {children}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export default Button;

const styles = StyleSheet.create({
  button: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    elevation: 2,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    elevation: 0,
    shadowOpacity: 0,
  },
  textDisabled: {
    color: "#6f6f6f",
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
