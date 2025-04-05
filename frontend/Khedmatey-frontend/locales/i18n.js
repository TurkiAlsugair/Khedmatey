import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import en from "./en.json";
import ar from "./ar.json";

// Detect system language
const systemLanguage = getLocales()[0]?.languageCode === "ar" ? "ar" : "en";

// Function to get stored language or fallback to system language
const getStoredLanguage = async () => {
  const savedLang = await AsyncStorage.getItem("appLanguage");
  return savedLang || systemLanguage; // Use stored language or system language
};

// Initialize i18next
const initializeI18n = async () => {
  const lng = await getStoredLanguage(); // Get language before initializing

  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: "en", // Default language
    lng: "en", // Set the initial language from storage (till now it will be hardcoded, it should be the lng )
    interpolation: { escapeValue: false },
  });
};

// Function to change language manually (Later will be used)
export const changeLanguage = async (lang) => {
  await AsyncStorage.setItem("appLanguage", lang);
  i18n.changeLanguage(lang);
};

initializeI18n();

export default i18n;
