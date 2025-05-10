import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function Price({
  price,
  size = wp(3.2),
  color = "#666",
  isBold = true,
  header = "Price",
  cusStyles={},
}) {
  // Calculate riyal logo size based on font size
  const riyalWidth = size * 1.3; // 2x the font size
  const riyalHeight = size * 0.8; // 80% of font size for proper proportions

  return (
    <View style={[styles.priceCont, cusStyles]}>
      <Text
        style={[
          styles.price,
          { fontSize: size, color },
          isBold && { fontWeight: "bold" },
        ]}
      >
        {header}:{" "}
      </Text>
      <View>
        <Image
          style={[styles.riyalLogo, { width: riyalWidth, height: riyalHeight }]}
          source={require("../assets/images/SaudiRiyalSymbol.svg")}
          // placeholder={""}
          contentFit="contain"
          // transition={1000}
        />
      </View>
      <Text style={[styles.price, { fontSize: size }]}>{price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  priceCont: {
    flexDirection: "row",
    alignItems: "center",
    // marginTop: 10,
  },
  price: {
    fontSize: wp(3.2),
    color: "#666",
  },
  riyalLogo: {
    // width and height will be set dynamically
  },
});
