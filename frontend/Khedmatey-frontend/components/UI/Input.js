import { View, Text, TextInput, StyleSheet } from "react-native";
import { useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../constants/styles";
import i18n from "../../locales/i18n";

function Input({
  label,
  keyboardType,
  onUpdateValue,
  value,
  placeholder,
  placeholderTextColor = "#b8b8b8",
  labelFontSize,
  labelColor,
  isInvalid,
  errorMessage,
  isReadOnly = false,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isArabic = i18n.language === "ar";

  return (
    <View style={styles.inputContainer}>
      <Text
        style={[
          styles.label,
          { fontSize: labelFontSize, color: labelColor },
          ,
          { textAlign: isArabic ? "right" : "left" },
        ]}
      >
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.focusedInput,
          isInvalid && styles.invalidInput,
          isReadOnly && styles.readOnly,
          { textAlign: isArabic ? "right" : "left" },
        ]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        onChangeText={onUpdateValue}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        readOnly={isReadOnly}
      />
      {isInvalid && (
        <Text style={[styles.errorText, { textAlign: isArabic ? "right" : "left" }]}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: Colors.background,
    borderRadius: 4,
    fontSize: wp(3.5),
    borderWidth: 1,
    borderColor: "#ddd",
  },
  focusedInput: {
    borderColor: Colors.primary, // You can change this color to fit your theme
  },
  invalidInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: wp(3.5),
    marginTop: 4,
  },
  readOnly: {
    backgroundColor: "rgba(211, 211, 211, 0.6)",
  },
});
