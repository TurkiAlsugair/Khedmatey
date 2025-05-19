import { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AuthContext } from "../../../context/AuthContext";
import { Colors } from "../../../constants/styles";
import Input from "../../../components/UI/Input";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";

export default function MyAccountScreen({ navigation }) {
  const { userInfo } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <Input
        label="Username"
        keyboardType="default"
        value={userInfo.username}
        labelFontSize={wp(3.8)}
        labelColor="#6F6F6F"
        isReadOnly={true}
      />

      <Input
        label="Phone Number"
        value={userInfo.phoneNumber}
        placeholderTextColor="rgb(126, 126, 126))"
        labelFontSize={wp(3.8)}
        labelColor="#6F6F6F"
        isReadOnly={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  backButtonContainer: {
    marginBottom: hp(2),
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    width: wp(10),
  },
});
