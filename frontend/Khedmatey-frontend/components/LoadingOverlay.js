import { StyleSheet, View, Dimensions } from "react-native";
import LottieView from "lottie-react-native";
import { Colors } from "../constants/styles";

export default function LoadingOverlay() {
  return (
    <View style={styles.overlay}>
      <LottieView
        source={require("../assets/animations/loadingAnimation.json")}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(168, 168, 168, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  animation: {
    width: 150,
    height: 150,
  },
});
