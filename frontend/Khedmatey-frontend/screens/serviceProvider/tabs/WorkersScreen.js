import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../../constants/styles";
import Button from "../../../components/UI/Button";
import IconButton from "../../../components/UI/IconButton";

export default function WorkersScreen({ navigation }) {
  return (
    <View style={styles.mainCont}>
      <View style={styles.titleCont}>
        <Text style={styles.titleText}>Workers</Text>
        <View style={styles.addIconCont}>
          <IconButton
            icon="add"
            size={wp(6.5)}
            color={"white"}
            onPress={() => navigation.navigate("Add Worker")}
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
    padding: 30,
  },
  titleCont: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    padding: hp(2),
    alignSelf: "center",
    fontSize: wp(7.5),
    fontWeight: "bold",
  },
  addIconCont: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
});
