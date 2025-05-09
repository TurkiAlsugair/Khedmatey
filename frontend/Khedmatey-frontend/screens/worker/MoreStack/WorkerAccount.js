import { useContext, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { AuthContext } from "../../../context/AuthContext";
import { Colors } from "../../../constants/styles";
import Input from "../../../components/UI/Input";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function WorkerAccount({ navigation }) {
  const { userInfo, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Input
        label="Worker Name"
        placeholder={userInfo.username}
        placeholderTextColor="rgb(126, 126, 126))"
        labelFontSize={wp(3.8)}
        labelColor="#6F6F6F"
        isReadOnly={true}
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
        label="City"
        placeholder={userInfo.city}
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
});
