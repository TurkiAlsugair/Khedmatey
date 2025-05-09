import { View, Text, StyleSheet } from "react-native";
import { ORDER_STATUS_STYLES } from "../../../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Button from "../../../UI/Button";
import { useNavigation } from "@react-navigation/native";

export default function InvoicedContent({ order }) {
  const navigation = useNavigation();
  const colors = ORDER_STATUS_STYLES["INVOICED"];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Order Invoiced</Text>
      <Text style={styles.message}>
        The invoice has been generated for this order.
      </Text>

      <Button
        cusStyles={styles.button}
        onPress={() =>
          navigation.replace("Previous Order", { orderId: order.id })
        }
      >
        Click Here To See The Invoice
      </Button>
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
  button: {
    backgroundColor: ORDER_STATUS_STYLES["INVOICED"].text,
    marginTop: hp(3),
  },
});
