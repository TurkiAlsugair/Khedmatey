import { View, Text, Button, StyleSheet } from "react-native";

export default function DashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>Dashboard Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
