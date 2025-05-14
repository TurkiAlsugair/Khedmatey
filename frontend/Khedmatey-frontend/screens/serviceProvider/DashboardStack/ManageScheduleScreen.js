import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import Button from "../../../components/UI/Button";
import { Colors } from "../../../constants/styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../../context/AuthContext";

// Example parse/format helpers
function parseDDMMYYYYtoISO(ddMMYYYY) {
  const [day, month, year] = ddMMYYYY.split("/");
  return `${year}-${month}-${day}`; // "YYYY-MM-DD"
}
function parseISOtoDDMMYYYY(isoString) {
  const [year, month, day] = isoString.split("-");
  return `${day}/${month}/${year}`; // "DD/MM/YYYY"
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function ManageScheduleScreen({ navigation }) {
  
  const [busyDates, setBusyDates] = useState(new Set());
  const [blockedDates, setBlockedDates] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const { token , userInfo} = useContext(AuthContext);

  const todayISO = moment().format("YYYY-MM-DD");
  const maxDateISO = moment().add(1, "month").format("YYYY-MM-DD");

  const blockedArrayDDMMYYYY = Array.from(blockedDates).map(parseISOtoDDMMYYYY);

  console.log(blockedArrayDDMMYYYY);

  // FETCH data
  useEffect(() => {
    const fetchUnavailable = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/service-provider/${userInfo.id}/schedule`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { busyDates: bD = [], blockedDates: blkD = [] } =
          res.data.data || {};

        const busySet = new Set(bD.map(parseDDMMYYYYtoISO));
        const blockSet = new Set(blkD.map(parseDDMMYYYYtoISO));

        setBusyDates(busySet);
        setBlockedDates(blockSet);
      } catch (error) {
        console.error("Error fetching unavailable dates:", error);
        Alert.alert("Error", "Failed to load schedule.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnavailable();
  }, []);

  // TOGGLE a date in blockedDates
  const handleDayPress = (dayObj) => {
    const { dateString } = dayObj; // "YYYY-MM-DD"
    // If it's busy, do nothing:
    if (busyDates.has(dateString)) {
      Alert.alert("Busy Day", "This date is already occupied by a customer.");
      return;
    }

    // Otherwise, toggle in blockedDates:
    setBlockedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dateString)) {
        // remove it
        newSet.delete(dateString);
      } else {
        // add it
        newSet.add(dateString);
      }
      return newSet;
    });
  };

  // Build "markedDates" object for the Calendar:
  const markedDates = {};
  // 1) Mark busy dates with red dot & disable them:
  busyDates.forEach((iso) => {
    markedDates[iso] = {
      disabled: true,
      disableTouchEvent: true,
      marked: true,
      dotColor: "red",
    };
  });
  // 2) Mark blocked dates as "selected" (multi):
  blockedDates.forEach((iso) => {
    // if it also was busy => skip. But we've already set it above as busy+disabled
    if (!markedDates[iso]) {
      markedDates[iso] = {};
    }
    markedDates[iso].selected = true;
    // For a blackish color:
    markedDates[iso].selectedColor = "#444"; // or "grey" / "black"
    markedDates[iso].selectedTextColor = "#fff";
  });
  // 3) If "today" is not busy or blocked, show a secondary dot
  if (!busyDates.has(todayISO) && !blockedDates.has(todayISO)) {
    if (!markedDates[todayISO]) markedDates[todayISO] = {};
    markedDates[todayISO].marked = true;
    markedDates[todayISO].dotColor = Colors.secondary;
  }

  // For disallowing picking in the past:
  const minDate = todayISO;

  // Handle updating the final blocked set:
  const handleUpdateSchedule = async () => {
    try {
      setLoading(true);
      // Convert blockedDates from ISO => dd/mm/yyyy
      const blockedArrayDDMMYYYY =
        Array.from(blockedDates).map(parseISOtoDDMMYYYY);

      // Send to backend:
      await axios.post(
        `${API_BASE_URL}/service-provider/${userInfo.id}/schedule`,
        { dates: blockedArrayDDMMYYYY },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show success toast
      Toast.show({
        type: "success",
        text1: `Schedule updated successfully`,
        visibilityTime: 2000,
        topOffset: hp(7),
      });
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update schedule.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Schedule</Text>

      <Calendar
        minDate={minDate}
        maxDate={maxDateISO}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          arrowColor: Colors.primary,
        }}
      />

      <View style={styles.labelsCont}>
        <View style={styles.labelCont}>
          <Entypo name="dot-single" size={20} color="red" />
          <Text style={styles.labelText}>Busy Days</Text>
        </View>
        <View style={styles.labelCont}>
          <Entypo name="dot-single" size={20} color={Colors.secondary} />
          <Text style={styles.labelText}>Today</Text>
        </View>
        <View style={styles.labelCont}>
          <Ionicons name="ellipse" size={15} color={"#444"} />
          <Text style={styles.labelText}>Blocked Days</Text>
        </View>
      </View>
      <Text>* Blocked Days Only That Can Be Changed</Text>
      <Button onPress={handleUpdateSchedule} cusStyles={styles.updateBtn}>
        Update Schedule
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: hp(8),
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    marginBottom: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  labelsCont: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "rgb(230, 230, 230)",
    borderRadius: 10,
    marginVertical: hp(2),
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(4),
  },
  labelCont: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  updateBtn: {
    alignSelf: "center",
    width: "80%",
    marginTop: 30,
  },
});