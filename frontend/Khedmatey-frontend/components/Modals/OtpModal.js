import { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Button from "../../components/UI/Button";
import { Colors } from "../../constants/styles";
import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function OtpModal({
  visible,
  phoneNumber,
  extraData = {},
  verifyUrl, // The verification endpoint
  onClose,
  onVerify,
  isAuth = false,
}) {
  const [otp, setOtp] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setError(""); // Clear error when modal opens
      setOtp(""); // Clear OTP input when modal opens
    }
  }, [visible]);

  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, countdown]);

  const handleVerifyOtp = async () => {
    setError("");

    if (otp.length !== 4 || isNaN(otp)) {
      setError("OTP must be exactly 4 digits.");
      return;
    }

    console.log(
      `Verifying OTP for: ${phoneNumber}, extraData: ${JSON.stringify(
        extraData,
        null,
        2
      )}`
    );
    try {
      const response = await axios.post(`${API_BASE_URL}${verifyUrl}`, {
        phoneNumber,
        ...extraData,
        otpCode: otp,
      });

      onVerify(response.data.data);

      console.log(`OTP verified, user ${JSON.stringify(extraData, null, 2)}`);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong.");
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/sendOTP`, { phoneNumber });
      alert(`A new OTP has been sent to ${phoneNumber}`);
      setResendDisabled(true);
      setCountdown(30);
      extraData.phoneNumber = phoneNumber;
      console.log(
        `OTP resent, \n payload: ${JSON.stringify(extraData, null, 2)} }`
      );
    } catch (error) {
      alert("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Enter OTP</Text>

          <OtpInput
            numberOfDigits={4}
            onTextChange={(value) => {
              setOtp(value);
              setError("");
            }}
            focusColor={Colors.primary}
            autoFocus
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonsCont}>
            <Text onPress={onClose} style={{ color: "red", fontSize: 16 }}>
              Cancel
            </Text>
            <Button onPress={handleVerifyOtp}>Verify OTP</Button>
          </View>

          {resendDisabled ? (
            <Text style={{ color: "#6F6F6F", fontSize: wp(4.5) }}>
              Resend OTP in {countdown}s
            </Text>
          ) : (
            <Text
              onPress={handleResendOtp}
              style={{
                color: Colors.primary,
                fontWeight: "bold",
                fontSize: wp(4.5),
              }}
            >
              Resend OTP
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(63, 63, 63, 0.5)",
  },
  modalBox: {
    width: "80%",
    height: "50%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-around",
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  buttonsCont: {
    width: "65%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
  },
});
