import { View, Text, Button, StyleSheet } from "react-native";

export default function HelpScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Help Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
