import AppNavigator from "./navigation/AppNavigator";
import { AuthProvider } from "./context/AuthContext";
import "./locales/i18n"; // Import translation setup (this will execute i18n.js)
import Toast from "react-native-toast-message";

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
      <Toast />
    </AuthProvider>
  );
}
