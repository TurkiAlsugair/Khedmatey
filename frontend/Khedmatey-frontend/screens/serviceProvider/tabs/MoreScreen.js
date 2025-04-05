import { View, Text, StyleSheet, Alert } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { Colors } from "../../../constants/styles";
import Option from "../../../components/MoreScreen/Option";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

export default function MoreScreen({ navigation }) {
  const { userInfo, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.mainCont}>
      <Text style={styles.title}>{userInfo?.username}</Text>
      <View style={styles.contentCont}>
        <View>
          <Option
            optionText="Company Account"
            optionIcon="people"
            otherIcon="chevron-forward-outline"
            onPress={() => navigation.navigate("Company Account")}
          />
          <Option
            optionText="About Khedmatey"
            optionIcon="ellipse"
            otherIcon="chevron-forward-outline"
            onPress={() => console.log("go to about screen")}
          />
          <Option
            optionText="Privacy & Terms"
            optionIcon="newspaper"
            otherIcon="chevron-forward-outline"
            onPress={() => console.log("go to terms screen")}
          />
          <Option
            optionText="Change Language"
            optionIcon="globe-outline"
            otherIcon="chevron-forward-outline"
            onPress={() => console.log("go to language screen")}
          />
          <Option
            optionText="Logout"
            optionIcon="log-out-outline"
            otherIcon="chevron-forward-outline"
            optionIconColor="red"
            optionTextColor="red"
            onPress={handleLogout}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    flex: 1,
    paddingTop: hp(1.7),
    backgroundColor: Colors.background,
  },
  title: {
    padding: hp(2),
    alignSelf: "center",
    fontSize: wp(5.5),
    fontWeight: "bold",
  },
  contentCont: {
    flex: 1,
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#dddddd",
  },
});
