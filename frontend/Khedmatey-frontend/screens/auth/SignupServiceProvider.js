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
import MultiSelectInput from "../../components/SelectInputs/MultiSelect";
import { AuthContext } from "../../context/AuthContext";
import { Colors } from "../../constants/styles";
import IconButton from "../../components/UI/IconButton";
import { cities } from "../../constants/data";
import i18n from "../../locales/i18n";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

const citiesList = cities;

export default function SignupServiceProviderScreen({ navigation }) {
  const { t } = useTranslation();
  const isArabic = i18n.language === "ar";

  const { login } = useContext(AuthContext);
  const [formState, setFormState] = useState({
    username: { value: "", isValid: true },
    email: { value: "", isValid: true },
    phoneNumber: { value: "", isValid: true },
    cities: { value: [], isValid: true },
  });

  const [backendError, setBackendError] = useState("");
  const [otpVisible, setOtpVisible] = useState(false);

  // **Validation functions**
  const validateName = (input) => input.trim().length > 0;
  const validatePhoneNumber = (input) => /^05\d{8}$/.test(input); // Must start with "05" and be 10 digits
  const validateEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

  // **Handle input changes**
  const handleInputChange = (field, value) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: { value, isValid: true },
    }));
    setBackendError("");
  };

  // **Handle signup button press**
  const handleSignup = async () => {
    const isUsernameValid = validateName(formState.username.value);
    const isPhoneValid = validatePhoneNumber(formState.phoneNumber.value);
    const isEmailValid = validateEmail(formState.email.value);
    const isCitiesValid = formState.cities.value.length > 0;

    if (!isUsernameValid || !isPhoneValid || !isEmailValid || !isCitiesValid) {
      setFormState((prevState) => ({
        ...prevState,
        username: { ...prevState.username, isValid: isUsernameValid },
        phoneNumber: { ...prevState.phoneNumber, isValid: isPhoneValid },
        email: { ...prevState.email, isValid: isEmailValid },
        cities: { ...prevState.cities, isValid: isCitiesValid },
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
    <View style={styles.mainCont}>
      <View
        style={[styles.backButtonCont, { alignSelf: isArabic && "flex-end" }]}
      >
        <IconButton
          color={"black"}
          size={30}
          icon={isArabic ? "arrow-forward" : "arrow-back"}
          onPress={() => navigation.goBack()}
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { textAlign: isArabic && "right" }]}>
          {t("SP registration title")}
        </Text>

        {/* Inputs */}
        <View style={styles.formCont}>
          <Input
            label={t("companyName")}
            placeholder={t("companyNamePlaceholder")}
            keyboardType="default"
            onUpdateValue={(value) => handleInputChange("username", value)}
            value={formState.username.value}
            labelFontSize={wp(3.8)}
            labelColor="#6F6F6F"
            isInvalid={!formState.username.isValid}
            errorMessage={"Name cannot be empty"}
          />

          <Input
            label={t("email")}
            placeholder="email@x.com"
            keyboardType="email-address"
            onUpdateValue={(value) => handleInputChange("email", value)}
            value={formState.email.value}
            labelFontSize={wp(3.8)}
            labelColor="#6F6F6F"
            isInvalid={!formState.email.isValid}
            errorMessage={"Invalid email address"}
          />

          <Input
            label={t("phoneNumber")}
            placeholder="05XXXXXXXX"
            keyboardType="phone-pad"
            onUpdateValue={(value) => handleInputChange("phoneNumber", value)}
            value={formState.phoneNumber.value}
            labelFontSize={wp(3.8)}
            labelColor="#6F6F6F"
            isInvalid={!formState.phoneNumber.isValid}
            errorMessage={"Invalid phone format (05XXXXXXXX)"}
          />
          <MultiSelectInput
            label={t("selectCities")}
            placeholder={t("selectCitiesPlaceholder")}
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
        </View>

        {/* Show backend error message */}
        {backendError ? (
          <Text style={styles.backendError}>{backendError}</Text>
        ) : null}

        {/* Register Button */}
        <Button onPress={handleSignup}>{t("register")}</Button>

        {/* OTP Modal */}
        <OtpModal
          visible={otpVisible}
          phoneNumber={formState.phoneNumber.value}
          extraData={{
            username: formState.username.value,
            email: formState.email.value,
            cities: formState.cities.value,
          }}
          verifyUrl="/auth/serviceProvider/signup/verifyOtp"
          onClose={() => setOtpVisible(false)}
          onVerify={(data) => {
            const { accessToken, user } = data;
            setOtpVisible(false);
            login(accessToken, user.userRole, user);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    flex: 1,
    backgroundColor: "white",
  },
  backButtonCont: {
    alignSelf: "flex-start",
    padding: hp(2),
  },
  contentContainer: {
    flex: 1,
    paddingBottom: hp(18),
    paddingHorizontal: wp(7),
    gap: hp(4),
    marginTop: hp(5),
  },
  formCont: {
    gap: hp(2.5),
  },
  title: {
    fontSize: wp(6),
    fontWeight: "bold",
  },
  backendError: {
    color: "red",
    fontSize: wp(4),
    marginTop: 8,
  },
});
