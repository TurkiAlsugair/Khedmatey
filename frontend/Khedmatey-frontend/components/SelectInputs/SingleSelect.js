import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const SingleSelect = ({
  label,
  data,
  placeholder,
  value,
  onChange,
  isInvalid,
  errorMessage,
}) => {
  return (
    <View style={{ marginBottom: 10 }}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Dropdown
        mode="modal"
        style={[styles.dropdown, isInvalid && styles.invalidDropdown]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        containerStyle={{ maxHeight: hp(46) }}
        activeColor="rgba(128, 198, 57, 0.47)"
        data={data}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        search
        searchPlaceholder="Search..."
        onChange={onChange}
        // renderLeftIcon={() => (
        //   <Ionicons name="chevron-down" size={20} color="#aaa" />
        // )}
      />

      {isInvalid && errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
};

export default SingleSelect;

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
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 5,
  },
});
