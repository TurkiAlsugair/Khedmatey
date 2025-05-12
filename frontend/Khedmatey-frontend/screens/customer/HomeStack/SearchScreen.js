import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "../../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import ServicesResultsTab from "../../../components/Search/ServicesResultsTab";
import ProvidersResultsTab from "../../../components/Search/ProvidersResultsTab";
import PreviousSearches from "../../../components/Search/PreviousSearches";
import { LocationContext } from "../../../context/LocationContext";
import { AuthContext } from "../../../context/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const STORAGE_KEY = "prev_searches_v1";

export default function SearchScreen({ navigation }) {
  /* ────────────────────────── local state */
  const insets = useSafeAreaInsets();
  const { token } = useContext(AuthContext);
  const { location } = useContext(LocationContext);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState("");

  const [hasSearched, setHasSearched] = useState(false);

  /** results */
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);

  /** tabs */
  const [activeTab, setActiveTab] = useState(0); // 0 = services
  const sliderAnim = useRef(new Animated.Value(0)).current;

  /** prev searches */
  const [prevSearches, setPrevSearches] = useState([]);

  /* ────────────────────────── load prev searches once */
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setPrevSearches(JSON.parse(stored));
    })();
  }, []);

  /* ────────────────────────── helpers */
  const savePrevSearches = async (arr) => {
    setPrevSearches(arr);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  };

  const removeOnePrev = async (item) => {
    const filtered = prevSearches.filter((q) => q !== item);
    savePrevSearches(filtered);
  };

  const clearPrev = async () => savePrevSearches([]);

  /* ────────────────────────── search */
  const runSearch = async (text) => {
    if (!text.trim()) return;
    setHasSearched(true);
    setLoading(true);
    setBackendError("");
    try {
      const res = await axios.get(`${API_BASE_URL}/search`, {
        params: { searchTerm: text.trim(), city: location?.city || "" },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // if the response changed to { data: { services: [], providers: []} } }
      // const data = res.data.data || {};
      // setServices(data.services || []);
      // setProviders(data.providers || []);
      
      setServices(res.data.services || []);
      setProviders(res.data.providers || []);
      console.log("Search response:", res.data);
      console.log("Services:", res.data.services);
      console.log("Providers:", res.data.providers);

      /** store in history (keep unique & max 10) */
      const newHistory = [
        text.trim(),
        ...prevSearches.filter((q) => q !== text.trim()),
      ].slice(0, 10);
      savePrevSearches(newHistory);
    } catch (err) {
      setBackendError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────────── tab switch animation */
  const switchTab = (idx) => {
    setActiveTab(idx);
    Animated.timing(sliderAnim, {
      toValue: idx,
      duration: 250,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  /* ────────────────────────── render */
  const showPrev = !hasSearched;
  return (
    <>
      <StatusBar barStyle={"light-content"} />
      <View style={styles.container}>
        {/* ─── header ─── */}
        <View style={[styles.headerCont, { paddingTop: insets.top + hp(1.5) }]}>
          <View style={styles.searchCont}>
            <Ionicons name="search" color="#8e8e8e" size={17} />
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Search…"
              placeholderTextColor="#8e8e8e"
              returnKeyType="search"
              onSubmitEditing={() => runSearch(query)}
              autoFocus
            />
          </View>
          <Text style={styles.cancelText} onPress={() => navigation.goBack()}>
            Cancel
          </Text>
        </View>

        {/* ─── content area ─── */}
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
          </View>
        ) : backendError ? (
          <View style={styles.loader}>
            <Text style={{ color: "red" }}>{backendError}</Text>
          </View>
        ) : showPrev ? (
          <PreviousSearches
            list={prevSearches}
            onPress={(q) => {
              setQuery(q);
              runSearch(q);
            }}
            onRemove={removeOnePrev}
            onClear={clearPrev}
          />
        ) : (
          <>
            {/* tabs */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => switchTab(0)}
              >
                <Text
                  style={[
                    styles.tabTxt,
                    activeTab === 0 && styles.tabTxtActive,
                  ]}
                >
                  Services
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tabBtn}
                onPress={() => switchTab(1)}
              >
                <Text
                  style={[
                    styles.tabTxt,
                    activeTab === 1 && styles.tabTxtActive,
                  ]}
                >
                  Service Providers
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sliderWrap}>
              <Animated.View
                style={[
                  styles.slider,
                  {
                    transform: [
                      {
                        translateX: sliderAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>

            {/* results */}
            <View style={{ flex: 1 }}>
              {activeTab === 0 ? (
                <ServicesResultsTab data={services} />
              ) : (
                <ProvidersResultsTab data={providers} />
              )}
            </View>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  /* header */
  headerCont: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    gap: wp(2.5),
  },
  searchCont: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.background,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flex: 1,
  },
  input: { flex: 1, fontSize: wp(3.5) },
  cancelText: { color: "#fff", fontSize: wp(4) },

  /* loader / error */
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },

  /* tabs */
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.background,
  },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabTxt: { fontSize: 16, color: "#777" },
  tabTxtActive: { color: "#333", fontWeight: "bold" },
  sliderWrap: { height: 3, backgroundColor: "#eee", flexDirection: "row" },
  slider: { width: "50%", backgroundColor: Colors.secondary },
});
