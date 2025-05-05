import { useContext, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { AuthContext } from "../../../context/AuthContext";
import { Colors } from "../../../constants/styles";
import Input from "../../../components/UI/Input";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import axios from "axios";
import Button from "../../../components/UI/Button";
import Toast from "react-native-toast-message";
import LoadingOverlay from "../../../components/LoadingOverlay";
import MultiSelectInput from "../../../components/SelectInputs/MultiSelect";
import { cities } from "../../../constants/data";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

const citiesList = cities;

export default function MyAccountScreen({ navigation }) {
  const { token, userInfo, updateUserInfo, logout } = useContext(AuthContext);
  const [formState, setFormState] = useState({
    username: { value: userInfo.username, isValid: true },
    cities: { value: userInfo.cities, isValid: true },
  });
  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateUsername = (input) => {
    return input.trim().length > 0;
  };

  function handleInputChange(field, value) {
    setFormState((prevState) => ({
      ...prevState,
      [field]: { value: value, isValid: true },
    }));
    setBackendError("");
  }

  async function handleUpdateAccount() {
    const isUsernameValid = validateUsername(formState.username.value);
    const isCitiesValid = formState.cities.value.length > 0;

    if (!isUsernameValid || !isCitiesValid) {
      setFormState((prevState) => ({
        ...prevState,
        username: { ...prevState.username, isValid: isUsernameValid },
        cities: { ...prevState.cities, isValid: isCitiesValid },
      }));
      return;
    }

    try {
      setLoading(true);
      const response = await axios.patch(
        `${API_BASE_URL}/serviceProvider/account`,
        { username: formState.username.value, cities: formState.cities.value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updateUserInfo({
        ...userInfo,
        username: formState.username.value,
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

    console.log("updating account");
  }

  return (
    <View style={styles.container}>
      <Text style={{ color: "rgb(130, 28, 209)", alignSelf: "center" }}>
        NOTE: Add Edit Image Later / Initially: Default Image
      </Text>
      <Input
        label="Username"
        keyboardType="default"
        onUpdateValue={(value) => handleInputChange("username", value)}
        value={formState.username.value}
        labelFontSize={wp(3.8)}
        labelColor="#6F6F6F"
        isInvalid={!formState.username.isValid}
        errorMessage={
          !formState.username.isValid ? "Username cannot be empty" : ""
        }
      />

      <Input
        label="Phone Number"
        placeholder={userInfo.phoneNumber}
        placeholderTextColor="rgb(126, 126, 126))"
        labelFontSize={wp(3.8)}
        labelColor="#6F6F6F"
        isReadOnly={true}
      />

      <Input
        label="Email"
        placeholder={userInfo.email}
        placeholderTextColor="rgb(126, 126, 126))"
        labelFontSize={wp(3.8)}
        labelColor="#6F6F6F"
        isReadOnly={true}
      />

      <MultiSelectInput
        label="Select Cities"
        placeholder="Choose your cities"
        data={citiesList}
        value={formState.cities.value}
        onChange={(selected) =>
          setFormState((prevState) => ({
            ...prevState,
            cities: { value: selected, isValid: true },
          }))
        }
        isInvalid={!formState.cities.isValid}
        errorMessage="Please select at least one city."
      />

      {backendError && <Text style={styles.backendError}>{backendError}</Text>}

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
