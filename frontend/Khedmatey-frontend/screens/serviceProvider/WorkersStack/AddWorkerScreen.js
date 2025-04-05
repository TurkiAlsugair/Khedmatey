import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../../constants/styles";
import Button from "../../../components/UI/Button";
import Input from "../../../components/UI/Input";
import { useContext, useState } from "react";
import { AuthContext } from "../../../context/AuthContext";
import axios from "axios";
import Toast from "react-native-toast-message";
import LoadingOverlay from "../../../components/LoadingOverlay";
import OtpModal from "../../../components/Modals/OtpModal"; // ← You already have this

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function AddWorkerScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formState, setFormState] = useState({
    username: { value: "", isValid: true },
    phoneNumber: { value: "", isValid: true },
  });
  const [otpVisible, setOtpVisible] = useState(false);

  // Validation
  const validateUsername = (input) => {
    return input.trim().length > 0;
  };
  const validatePhoneNumber = (input) => {
    const phoneRegex = /^05\d{8}$/; // Must start with "05" and be 10 digits
    return phoneRegex.test(input);
  };

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

    if (!isUsernameValid || !isPhoneValid) {
      setFormState((prevState) => ({
        username: { value: prevState.username.value, isValid: isUsernameValid },
        phoneNumber: {
          value: prevState.phoneNumber.value,
          isValid: isPhoneValid,
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
          onUpdateValue={(value) => handleInputChange("username", value)}
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
          placeholder="05XXXXXXXX"
          keyboardType="phone-pad"
          onUpdateValue={(value) => handleInputChange("phoneNumber", value)}
          value={formState.phoneNumber.value}
          labelFontSize={wp(3.8)}
          labelColor="#6F6F6F"
          isInvalid={!formState.phoneNumber.isValid}
          errorMessage={
            !formState.phoneNumber.isValid
              ? "Invalid phone format (05XXXXXXXX)"
              : ""
          }
        />
      </View>

      {backendError ? (
        <Text style={styles.backendError}>{backendError}</Text>
      ) : null}

      {/* Button triggers handleSendOtp */}
      <Button cusStyles={styles.addWorkerButton} onPress={handleSendOtp}>
        Send OTP
      </Button>

      {loading && <LoadingOverlay />}

      {/* OTP Modal */}
      <OtpModal
        visible={otpVisible}
        phoneNumber={formState.phoneNumber.value}
        extraData={{ username: formState.username.value }}
        verifyUrl="/serviceProvider/workers"
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
  },
});
