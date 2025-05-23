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
import { Colors } from "../../constants/styles";
import OtpModal from "../../components/Modals/OtpModal";
import { AuthContext } from "../../context/AuthContext";
import i18n from "../../locales/i18n";
import { Image } from "expo-image";

// Using the mock API for now, till Twilio is ready.
const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);
  const [formState, setFormState] = useState({
    phoneNumber: { value: "", isValid: true }, // Start with valid (no red border initially)
  });
  const [backendError, setBackendError] = useState(""); // Generic backend error
  const [otpVisible, setOtpVisible] = useState(false);

  const isArabic = i18n.language === "ar";

  const handleInputChange = (value) => {
    setFormState({ phoneNumber: { value, isValid: true } });
    setBackendError("");
  };

  const validatePhoneNumber = (input) => {
    const phoneRegex = /^\+9665\d{8}$/;
    return phoneRegex.test(input);
  };

  const handleSendOtp = async () => {
    const isPhoneValid = validatePhoneNumber(formState.phoneNumber.value);
    if (!isPhoneValid) {
      setFormState((prevState) => ({
        phoneNumber: { value: prevState.phoneNumber.value, isValid: false },
      }));
      return;
    }

    try {
      // const response = await axios.post(`${API_BASE_URL}/auth/sendOTP`, {
      //   phoneNumber: formState.phoneNumber.value,
      // });

      setOtpVisible(true);
    } catch (error) {
      setBackendError(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.logoCont}>
      <Image
          style={[styles.appLogo]}
          source={require("../../assets/images/AppLogo.svg")}
          // placeholder={""}
          contentFit="contain"
          // transition={1000}
        />
      </View>
      <View style={styles.contentCont}>
        <Text style={[styles.title, { textAlign: isArabic ? "right" : "left" }]}>
          {t("loginTitle")}
        </Text>

        <Input
          label={t("phoneNumber")}
          placeholder="+9665XXXXXXXX"
          keyboardType="phone-pad"
          onUpdateValue={handleInputChange}
          value={formState.phoneNumber.value}
          labelFontSize={wp(3.8)}
          labelColor="#6F6F6F"
          isInvalid={!formState.phoneNumber.isValid} // Red border only on submit
          errorMessage={
            !formState.phoneNumber.isValid
              ? isArabic
                ? "(+9665XXXXXXXX) الرقم يجب ان يكون بصيغة "
                : "Invalid phone format (+9665XXXXXXXX)"
              : ""
          }
        />

        {/* Show backend error message */}
        {backendError ? (
          <Text style={styles.backendError}>{backendError}</Text>
        ) : null}

        <Button onPress={handleSendOtp}> {t("login")}</Button>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1, height: 2, backgroundColor: "#6F6F6F" }} />
          <View>
            <Text style={{ width: 50, textAlign: "center" }}>{t("OR")}</Text>
          </View>
          <View style={{ flex: 1, height: 2, backgroundColor: "#6F6F6F" }} />
        </View>

        <View style={styles.signupCont}>
          <Text style={{ color: "#6F6F6F", fontSize: wp(4.5) }}>
            {t("Don't have")}{" "}
            <Text
              style={{
                color: Colors.primary,
                fontWeight: "bold",
              }}
              onPress={() => navigation.navigate("SignupCustomer")}
            >
              {t("signup")}
            </Text>
          </Text>
        </View>
      </View>

      {/* OTP Modal */}
      <OtpModal
        visible={otpVisible}
        phoneNumber={formState.phoneNumber.value}
        // here i can control what to return as a response by adding params ********
        verifyUrl="/auth/signin"
        onClose={() => setOtpVisible(false)}
        onVerify={(data) => {
          const { accessToken, user } = data;
          setOtpVisible(false);
          login(accessToken, user.role, user);
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
    height: hp(20),
    alignItems: "center",
    justifyContent: "center",
  },
  contentCont: {
    gap: hp(4),
  },
  signupCont: {
    alignItems: "center",
    marginTop: hp(3),
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
  appLogo:{
    width: wp(30),
    height: hp(30),
    marginBottom: hp(4),
  }
});
