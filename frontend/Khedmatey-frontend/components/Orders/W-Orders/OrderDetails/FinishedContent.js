import { View, Text, StyleSheet } from "react-native";
import { ORDER_STATUS_STYLES } from "../../../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function FinishedContent({ order }) {
  const colors = ORDER_STATUS_STYLES["FINISHED"];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Order Finished</Text>
      <Text style={styles.message}>
        This order was completed successfully, and a follow-up service has been
        sent. Waiting for customer response. Thanks for your work.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 8,
    // marginVertical: hp(2),
  },
  title: {
    fontSize: wp(5.5),
    fontWeight: "bold",
    marginBottom: hp(1),
  },
  message: {
    fontSize: wp(4),
    color: "#444",
  },
});
