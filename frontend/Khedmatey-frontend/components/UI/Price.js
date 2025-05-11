import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function Price({
  value,
  size = wp(3.2),
  color = "#666",
  isBold = true,
  header = "Price",
  cusStyles = {},
  headerShown = true,
}) {
  // Calculate riyal logo size based on font size
  const riyalWidth = size * 1.3; // 1.3x the font size
  const riyalHeight = size * 0.8; // 80% of font size for proper proportions

  return (
    <View style={[styles.priceCont, cusStyles]}>
      {headerShown && (
        <Text
          style={[
            styles.price,
            { fontSize: size, color },
            isBold && { fontWeight: "bold" },
          ]}
        >
          {header}:{" "}
        </Text>
      )}
      <View>
        <Image
          style={[styles.riyalLogo, { width: riyalWidth, height: riyalHeight }]}
          source={require("../../assets/images/SaudiRiyalSymbol.svg")}
          contentFit="contain"
        />
      </View>
      <Text 
        style={[
          styles.price, 
          { fontSize: size },
          isBold && { fontWeight: "bold" }
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  priceCont: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: wp(3.2),
    color: "#666",
  },
  riyalLogo: {
    // width and height will be set dynamically
  },
}); 