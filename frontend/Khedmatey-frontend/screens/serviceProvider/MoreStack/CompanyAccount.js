import React, { useContext, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../../constants/styles";
import Button from "../../../components/UI/Button";
import Input from "../../../components/UI/Input";
import { AuthContext } from "../../../context/AuthContext";
import axios from "axios";
import Toast from "react-native-toast-message";
import LoadingOverlay from "../../../components/LoadingOverlay";
import MultiSelectInput from "../../../components/SelectInputs/MultiSelect";
import { cities } from "../../../constants/data";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const citiesList = cities;

export default function MyAccountScreen({ navigation }) {
  const { token, userInfo, updateUserInfo, logout } = useContext(AuthContext);
  // userInfo is something like { username, usernameAR, phoneNumber, email, cities: [...] }

  const [formState, setFormState] = useState({
    username: { value: userInfo.username, isValid: true },
    usernameAR: { value: userInfo.usernameAR || "", isValid: true }, // new field
    email: { value: userInfo.email, isValid: true },
    cities: { value: userInfo.cities, isValid: true },
  });

  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);

  // Basic validations
  const validateUsername = (input) => input.trim().length > 0;
  const validateEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

  function handleInputChange(field, value) {
    setFormState((prev) => ({
      ...prev,
      [field]: { value, isValid: true },
    }));
    setBackendError("");
  }

  async function handleUpdateAccount() {
    const isUsernameValid = validateUsername(formState.username.value);
    const isUsernameARValid = validateUsername(formState.usernameAR.value);
    const isEmailValid = validateEmail(formState.email.value);
    const isCitiesValid = formState.cities.value.length > 0;

    if (!isUsernameValid || !isUsernameARValid || !isEmailValid || !isCitiesValid) {
      setFormState((prev) => ({
        ...prev,
        username: { ...prev.username, isValid: isUsernameValid },
        usernameAR: { ...prev.usernameAR, isValid: isUsernameARValid },
        email: { ...prev.email, isValid: isEmailValid },
        cities: { ...prev.cities, isValid: isCitiesValid },
      }));
      return;
    }

    try {
      setLoading(true);

      const response = await axios.patch(
        `${API_BASE_URL}/auth/service-provider/${userInfo.id}/account`,
        {
          username: formState.username.value,
          usernameAR: formState.usernameAR.value, // pass the new field
          email: formState.email.value,
          phoneNumber: userInfo.phoneNumber, // Include phoneNumber in the request
          cities: formState.cities.value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update userInfo in context
      updateUserInfo({
        ...userInfo,
        username: formState.username.value,
        usernameAR: formState.usernameAR.value,
        email: formState.email.value,
        cities: formState.cities.value,
      });

      Toast.show({
        type: "success",
        text1: "Account updated successfully!",
        visibilityTime: 2000,
        topOffset: hp(7),
      });
      navigation.goBack();
    } catch (error) {
      setBackendError(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={{ color: "rgb(130, 28, 209)", alignSelf: "center" }}>
        NOTE: Add/Edit Image Later / Initially: Default Image
      </Text>

      {/* EN name */}
      <Input
        label="Username (English)"
        keyboardType="default"
        onUpdateValue={(val) => handleInputChange("username", val)}
        value={formState.username.value}
        labelFontSize={wp(3.8)}
        labelColor="#6F6F6F"
        isInvalid={!formState.username.isValid}
        errorMessage={
          !formState.username.isValid ? "Username cannot be empty" : ""
        }
      />

      {/* AR name */}
      <Input
        label="Username (Arabic)"
        keyboardType="default"
        onUpdateValue={(val) => handleInputChange("usernameAR", val)}
        value={formState.usernameAR.value}
        labelFontSize={wp(3.8)}
        labelColor="#6F6F6F"
        isInvalid={!formState.usernameAR.isValid}
        errorMessage={
          !formState.usernameAR.isValid ? "Arabic username cannot be empty" : ""
        }
      />

      <Input
        label="Phone Number"
        placeholder={userInfo.phoneNumber}
        placeholderTextColor="rgb(126,126,126)"
        labelFontSize={wp(3.8)}
        labelColor="#6F6F6F"
        isReadOnly={true}
      />

      <Input
        label="Email"
        keyboardType="email-address"
        onUpdateValue={(val) => handleInputChange("email", val)}
        value={formState.email.value}
        labelFontSize={wp(3.8)}
        labelColor="#6F6F6F"
        isInvalid={!formState.email.isValid}
        errorMessage={
          !formState.email.isValid ? "Please enter a valid email address" : ""
        }
      />

      <MultiSelectInput
        label="Select Cities"
        placeholder="Choose your cities"
        data={citiesList}
        value={formState.cities.value}
        onChange={(selected) =>
          setFormState((prev) => ({
            ...prev,
            cities: { value: selected, isValid: true },
          }))
        }
        isInvalid={!formState.cities.isValid}
        errorMessage="Please select at least one city."
      />

      {backendError ? (
        <Text style={styles.backendError}>{backendError}</Text>
      ) : null}

      <View style={{ marginTop: hp(5), gap: hp(2) }}>
        <Button cusStyles={styles.updateButton} onPress={handleUpdateAccount}>
          Update Account
        </Button>
      </View>

      {loading && <LoadingOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  updateButton: {
    color: "white",
    fontWeight: "bold",
    padding: 15,
    alignSelf: "center",
    borderRadius: 10,
    width: wp(50),
  },
  backendError: {
    color: "red",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: wp(3.8),
  },
});
