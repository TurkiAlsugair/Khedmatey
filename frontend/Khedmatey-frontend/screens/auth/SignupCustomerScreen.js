import { View, Text, StyleSheet } from "react-native";
import { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import axios from "axios";

import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import OtpModal from "../../components/Modals/OtpModal";
import { AuthContext } from "../../context/AuthContext";
import { Colors } from "../../constants/styles";
import IconButton from "../../components/UI/IconButton";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function SignupCustomerScreen({ navigation }) {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);

  const [formState, setFormState] = useState({
    username: { value: "", isValid: true },
    phoneNumber: { value: "", isValid: true },
  });

  const [backendError, setBackendError] = useState(""); // Generic backend error
  const [otpVisible, setOtpVisible] = useState(false);

  // Validation functions (only called on submit)
  const validateUsername = (input) => {
    return input.trim().length > 0;
  };

  const validatePhoneNumber = (input) => {
    const phoneRegex = /^05\d{8}$/; // Example: Must start with "05" and be 10 digits
    return phoneRegex.test(input);
  };

  // Called when input changes
  const handleInputChange = (field, value) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: { value, isValid: true }, // Reset validation on typing
    }));
    setBackendError(""); // Reset backend error when user types
  };

  // Called when Sign-up button is pressed
  const handleSignup = async () => {
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
      const response = await axios.post(`${API_BASE_URL}/auth/sendOTP`, {
        phoneNumber: formState.phoneNumber.value,
      });

      setOtpVisible(true);
    } catch (error) {
      setBackendError(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.logoCont}>
        <Text style={styles.title}>Logo !!</Text>
      </View>
      <View style={styles.cont1}>
        <Text style={styles.title}>Create your account</Text>

        <View style={styles.formCont}>
          <Input
            label="Username"
            placeholder="Enter your username"
            keyboardType="default"
            onUpdateValue={(value) => handleInputChange("username", value)}
            value={formState.username.value}
            labelFontSize={wp(3.8)}
            labelColor="#6F6F6F"
            isInvalid={!formState.username.isValid} // Red border only on submit
            errorMessage={
              !formState.username.isValid ? "Username cannot be empty" : ""
            }
          />
          <Input
            label="Enter your phone number"
            placeholder="05XXXXXXXX"
            keyboardType="phone-pad"
            onUpdateValue={(value) => handleInputChange("phoneNumber", value)}
            value={formState.phoneNumber.value}
            labelFontSize={wp(3.8)}
            labelColor="#6F6F6F"
            isInvalid={!formState.phoneNumber.isValid} // Red border only on submit
            errorMessage={
              !formState.phoneNumber.isValid
                ? "Invalid phone format (05XXXXXXXX)"
                : ""
            }
          />
        </View>

        {/* Show backend error message */}
        {backendError ? (
          <Text style={styles.backendError}>{backendError}</Text>
        ) : null}

        <Button onPress={handleSignup}>Sign-up</Button>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1, height: 2, backgroundColor: "#6F6F6F" }} />
          <View>
            <Text style={{ width: 50, textAlign: "center" }}>OR</Text>
          </View>
          <View style={{ flex: 1, height: 2, backgroundColor: "#6F6F6F" }} />
        </View>

        <View style={styles.loginCont}>
          <Text style={{ color: "#6F6F6F", fontSize: wp(4.5) }}>
            You have an account ?{" "}
            <Text
              style={{ color: Colors.primary, fontWeight: "bold" }}
              onPress={() => navigation.navigate("Login")}
            >
              Login
            </Text>
          </Text>
        </View>

        <Button
          onPress={() => navigation.navigate("SignupServiceProvider")}
          cusStyles={{
            paddingVertical: 20,
            paddingHorizontal: 20,
            backgroundColor: "#478a37",
          }}
        >
          Register as a Service Provider
        </Button>
      </View>

      {/* OTP Modal */}
      <OtpModal
        visible={otpVisible}
        phoneNumber={formState.phoneNumber.value}
        extraData={{ username: formState.username.value }}
        // here i can control what to return as a response by adding params ********
        verifyUrl="/auth/customer/signup/verifyOtp"
        onClose={() => setOtpVisible(false)}
        onVerify={(data) => {
          const { accessToken, user } = data;
          setOtpVisible(false);
          login(accessToken, user.userRole, user);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: "start",
    justifyContent: "center",
    paddingBottom: hp(18),
    paddingHorizontal: wp(7),
    backgroundColor: "white",
  },
  logoCont: {
    alignItems: "center",
    justifyContent: "center",
  },
  cont1: {
    height: hp(40),
    gap: hp(4),
    marginTop: hp(7),
  },
  loginCont: {
    alignItems: "center",
  },
  title: {
    fontSize: wp(7),
    fontWeight: "bold",
  },
  backendError: {
    color: "red",
    fontSize: wp(4),
    marginTop: 8,
  },
  serviceProviderCont: {},
});
