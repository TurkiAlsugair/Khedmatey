import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { Colors } from "../../../constants/styles";
import Button from "../../../components/UI/Button";
import Input from "../../../components/UI/Input";
import SingleSelect from "../../../components/SelectInputs/SingleSelect";
import LoadingOverlay from "../../../components/LoadingOverlay";

import { AuthContext } from "../../../context/AuthContext";
import axios from "axios";
import Toast from "react-native-toast-message";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function EditWorkerScreen({ navigation, route }) {
  const { worker } = route.params; // Get worker data from route params
  const { token, userInfo } = useContext(AuthContext);
  const spCities = userInfo?.cities || [];

  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    username: { value: worker.username, isValid: true },
    phoneNumber: { value: worker.phoneNumber, isValid: true },
    city: { value: worker.city, isValid: true },
  });

  // Validation
  const validateUsername = (input) => input.trim().length > 0;
  const validateCity = (input) => input.trim().length > 0;

  // Handler for input changes
  function handleInputChange(field, value) {
    setFormState((prev) => ({
      ...prev,
      [field]: { value, isValid: true },
    }));
    setBackendError("");
  }

  async function handleUpdateWorker() {
    const isUsernameValid = validateUsername(formState.username.value);
    const isCityValid = validateCity(formState.city.value);

    if (!isUsernameValid || !isCityValid) {
      setFormState((prev) => ({
        ...prev,
        username: {
          value: prev.username.value,
          isValid: isUsernameValid,
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
      
      // PATCH request to update worker data
      await axios.patch(
        `${API_BASE_URL}/service-provider/${userInfo.id}/workers/${worker.id}/account`,
        {
          username: formState.username.value,
          city: formState.city.value,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Show success message
      Toast.show({
        type: "success",
        text1: "Worker updated successfully",
        visibilityTime: 2000,
        topOffset: hp(7),
      });

      // Navigate back to workers list
      navigation.goBack();
    } catch (error) {
      console.error("Error updating worker:", error);
      setBackendError(error.response?.data?.message || "Failed to update worker. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.mainCont}>
        <View style={styles.formCont}>
          <Input
            label="Worker Name"
            placeholder="Enter worker name"
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
            value={formState.phoneNumber.value}
            labelFontSize={wp(3.8)}
            labelColor="#6F6F6F"
            editable={false} // Make phone number read-only
            style={styles.readOnlyInput}
            isReadOnly={true}
          />

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

        <Button cusStyles={styles.updateButton} onPress={handleUpdateWorker}>
          {loading ? <ActivityIndicator color="white" size="small" /> : "Update Worker"}
        </Button>

        {loading && <LoadingOverlay />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainCont: {
    flex: 1,
    paddingTop: hp(3),
    backgroundColor: Colors.background,
    padding: 30,
    minHeight: hp(80),
  },
  formCont: {
    gap: hp(1),
  },
  updateButton: {
    marginTop: hp(4),
  },
  backendError: {
    color: "red",
    fontSize: wp(4),
    marginTop: 8,
    textAlign: "center",
  },
  readOnlyInput: {
    backgroundColor: "#f0f0f0",
    opacity: 0.8,
  },
}); 