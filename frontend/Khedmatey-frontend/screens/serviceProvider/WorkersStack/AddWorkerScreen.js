import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { Colors } from "../../../constants/styles";
import Button from "../../../components/UI/Button";
import Input from "../../../components/UI/Input";
import SingleSelect from "../../../components/SelectInputs/SingleSelect"; // a custom single-select component
import LoadingOverlay from "../../../components/LoadingOverlay";
import OtpModal from "../../../components/Modals/OtpModal";

import { AuthContext } from "../../../context/AuthContext";
import { ServicesContext } from "../../../context/ServicesContext"; // if you need
import axios from "axios";
import Toast from "react-native-toast-message";

// Using the mock API for now, till Twilio is ready.
const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function AddWorkerScreen({ navigation }) {
  const { token, userInfo } = useContext(AuthContext);
  // Suppose userInfo.cities = ["Riyadh","Jeddah","Unayzah"] for the service provider
  const spCities = userInfo?.cities || []; // fallback to empty array if not found

  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);

  const [formState, setFormState] = useState({
    username: { value: "", isValid: true },
    phoneNumber: { value: "", isValid: true },
    city: { value: "", isValid: true }, // new city field
  });

  // Validation
  const validateUsername = (input) => input.trim().length > 0;
  const validatePhoneNumber = (input) => {
    const phoneRegex = /^\+9665\d{8}$/; // Must start with "+9665" and be followed by 8 digits
    return phoneRegex.test(input);
  };
  const validateCity = (input) => input.trim().length > 0; // simple check for non-empty

  // Handler for input changes
  function handleInputChange(field, value) {
    setFormState((prev) => ({
      ...prev,
      [field]: { value, isValid: true },
    }));
    setBackendError("");
  }

  async function handleSendOtp() {
    const isUsernameValid = validateUsername(formState.username.value);
    const isPhoneValid = validatePhoneNumber(formState.phoneNumber.value);
    const isCityValid = validateCity(formState.city.value);

    if (!isUsernameValid || !isPhoneValid || !isCityValid) {
      setFormState((prev) => ({
        ...prev,
        username: {
          value: prev.username.value,
          isValid: isUsernameValid,
        },
        phoneNumber: {
          value: prev.phoneNumber.value,
          isValid: isPhoneValid,
        },
        city: {
          value: prev.city.value,
          isValid: isCityValid,
        },
      }));
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/auth/sendOTP`,
        {
          username: formState.username.value,
          phoneNumber: formState.phoneNumber.value,
          city: formState.city.value,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOtpVisible(true);
    } catch (error) {
      setBackendError(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.mainCont}>
      <View style={styles.formCont}>
        <Input
          label="Worker Name"
          placeholder="Enter your worker name"
          keyboardType="default"
          onUpdateValue={(val) => handleInputChange("username", val)}
          value={formState.username.value}
          labelFontSize={wp(3.8)}
          labelColor="#6F6F6F"
          isInvalid={!formState.username.isValid}
          errorMessage={
            !formState.username.isValid ? "Name cannot be empty" : ""
          }
        />

        <Input
          label="Phone Number"
          placeholder="+9665XXXXXXXX"
          keyboardType="phone-pad"
          onUpdateValue={(val) => handleInputChange("phoneNumber", val)}
          value={formState.phoneNumber.value}
          labelFontSize={wp(3.8)}
          labelColor="#6F6F6F"
          isInvalid={!formState.phoneNumber.isValid}
          errorMessage={
            !formState.phoneNumber.isValid
              ? "Invalid phone format (+9665XXXXXXXX)"
              : ""
          }
        />

        {/* New SingleSelect for city */}
        <SingleSelect
          label="Select City For the Worker"
          placeholder="Choose your worker's city"
          data={spCities.map((cityName) => ({
            label: cityName,
            value: cityName,
          }))}
          value={formState.city.value}
          onChange={(item) => handleInputChange("city", item.value)}
          isInvalid={!formState.city.isValid}
          errorMessage="City is required"
        />
      </View>

      {backendError ? (
        <Text style={styles.backendError}>{backendError}</Text>
      ) : null}

      {/* Trigger handleSendOtp */}
      <Button cusStyles={styles.addWorkerButton} onPress={handleSendOtp}>
        Send OTP
      </Button>

      {loading && <LoadingOverlay />}

      {/* OTP Modal */}
      <OtpModal
        visible={otpVisible}
        phoneNumber={formState.phoneNumber.value}
        extraData={{
          username: formState.username.value,
          city: formState.city.value, // if needed
        }}
        token={token}
        verifyUrl={`/service-provider/${userInfo.id}/workers`}
        onClose={() => setOtpVisible(false)}
        onVerify={(data) => {
          setOtpVisible(false);
          setLoading(false);
          Toast.show({
            type: "success",
            text1: "Worker added successfully!",
            visibilityTime: 2000,
            topOffset: hp(7),
          });

          navigation.goBack();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    flex: 1,
    paddingTop: hp(3),
    backgroundColor: Colors.background,
    padding: 30,
  },
  formCont: {
    gap: hp(1),
  },
  addWorkerButton: {
    marginTop: hp(4),
  },
  backendError: {
    color: "red",
    fontSize: wp(4),
    marginTop: 8,
    textAlign: "center",
  },
});
