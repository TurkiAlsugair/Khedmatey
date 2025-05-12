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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function MyAccountScreen({ navigation }) {
  const { token, userInfo, updateUserInfo, logout } = useContext(AuthContext);
  const [formState, setFormState] = useState({
    username: { value: userInfo.username, isValid: true },
  });
  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateUsername = (input) => {
    return input.trim().length > 0;
  };

  function handleInputChange(value) {
    setFormState({ username: { value: value, isValid: true } });
    setBackendError("");
  }

  async function handleUpdateAccount() {
    const isValidUsername = validateUsername(formState.username.value);

    if (!isValidUsername) {
      setFormState((prevState) => ({
        username: { value: prevState.username.value, isValid: false },
      }));
      return;
    }

    try {
      setLoading(true);
      const response = await axios.patch(
        `${API_BASE_URL}/customer/${userInfo.id}/account`,
        { 
          username: formState.username.value,
          phoneNumber: userInfo.phoneNumber  // Include phoneNumber in the request
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      updateUserInfo({ ...userInfo, username: formState.username.value });

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

  async function handleDeleteAccount() {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await axios.delete(`${API_BASE_URL}/customer/${userInfo.id}/account`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              Toast.show({
                type: "success",
                text1: "Account deleted successfully.",
                visibilityTime: 2000,
                topOffset: hp(7),
              });

              logout(); // Clears context and AsyncStorage
            } catch (error) {
              console.error(error);
              setBackendError(
                error.response?.data?.message || "Something went wrong."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Input
        label="Username"
        keyboardType="default"
        onUpdateValue={handleInputChange}
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

      {backendError && <Text style={styles.backendError}>{backendError}</Text>}

      <View style={{ marginTop: hp(5), gap: hp(2) }}>
        <Button cusStyles={styles.updateButton} onPress={handleUpdateAccount}>
          Update Account
        </Button>
        <Button cusStyles={styles.deleteButton} onPress={handleDeleteAccount}>
          Delete Account
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
  deleteButton: {
    backgroundColor: "rgba(224, 1, 1, 0.71)",
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
