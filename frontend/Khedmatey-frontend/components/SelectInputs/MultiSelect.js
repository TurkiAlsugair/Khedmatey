import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import i18n from "../../locales/i18n";

const MultiSelectInput = ({
  label,
  data,
  placeholder,
  value,
  onChange,
  isInvalid,
  errorMessage,
}) => {
  const renderSelectedItem = (item, unSelect) => (
    <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
      <View style={styles.selectedStyle}>
        <Text style={[styles.textSelectedStyle]}>{item.label}</Text>
        <Ionicons color="black" name="close" size={17} />
      </View>
    </TouchableOpacity>
  );

  const isArabic = i18n.language === "ar";

  return (
    <View style={{ marginBottom: 10 }}>
      {label && (
        <Text style={[styles.label, { textAlign: isArabic && "right" }]}>
          {label}
        </Text>
      )}

      <MultiSelect
        mode="modal"
        // maxHeight={hp(22.1)}
        // containerStyle={{ maxHeight: hp(46) }}
        activeColor="rgba(128, 198, 57, 0.47)"
        style={[
          styles.dropdown,
          isInvalid && styles.invalidDropdown,
          { textAlign: isArabic && "right" },
        ]}
        placeholderStyle={[
          styles.placeholderStyle,
          { textAlign: isArabic && "right" },
        ]}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={[
          styles.inputSearchStyle,
          { textAlign: isArabic && "right" },
        ]}
        iconStyle={styles.iconStyle}
        data={data}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        search
        searchPlaceholder={isArabic ? "البحث..." : "Search..."}
        onChange={onChange}
        renderSelectedItem={renderSelectedItem}
      />

      {isInvalid && errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
};

export default MultiSelectInput;

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    fontSize: wp(3.8),
    color: "#6F6F6F",
  },
  dropdown: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  invalidDropdown: {
    borderColor: "red",
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#aaa",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#333",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  selectedStyle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    marginRight: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
  },
  textSelectedStyle: {
    marginRight: 6,
    fontSize: 14,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 5,
  },
});
