import { View, Text, StyleSheet, Alert } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import { Colors } from "../../../constants/styles";
import Option from "../../../components/MoreScreen/Option";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import i18n from "../../../locales/i18n";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MoreScreen({ navigation }) {
  const { userInfo, logout } = useContext(AuthContext);
  const isArabic = i18n.language === "ar";
  const insets = useSafeAreaInsets();

  const logoutAlertTitle = isArabic ? "تأكيد تسجيل الخروج" : "Confirm Logout";
  const logoutAlertText = isArabic
    ? "هل انت متأكد من انك تريد تسجيل الخروج ؟"
    : "Are you sure you want to log out ?";
  const handleLogout = () => {
    Alert.alert(logoutAlertTitle, logoutAlertText, [
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
    <View style={[styles.mainCont, { paddingTop: insets.top }]}>
      <Text style={styles.title}>{userInfo?.username}</Text>
      <View style={styles.contentCont}>
        <View>
          <Option
            optionText="My Account"
            optionIcon="person"
            otherIcon="chevron-forward-outline"
            onPress={() => navigation.navigate("My Account")}
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
            optionText="Customer Service"
            optionIcon="headset"
            otherIcon="chevron-forward-outline"
            onPress={() => console.log("go to customer service screen")}
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
