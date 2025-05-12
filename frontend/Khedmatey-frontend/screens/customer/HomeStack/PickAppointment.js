import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import moment from "moment";
import Entypo from "@expo/vector-icons/Entypo";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../../constants/styles";
import ServiceItem from "../../../components/CustomerHome/ServiceItem";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../../components/UI/Button";
import { AuthContext } from "../../../context/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function PickAppointment({ navigation, route }) {
  const { token } = useContext(AuthContext);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const service = route.params.service;
  console.log("Service object:", JSON.stringify(service, null, 2));

  const todayISO = moment().format("YYYY-MM-DD");
  const maxDateISO = moment().add(1, "month").format("YYYY-MM-DD");

  /* ───────────────────────────────────────────
     1.  start with **no** selected date  🆕     */
  const [selectedDate, setSelectedDate] = useState(null);

  /* convert whenever it exists */
  const selectedDateInDDMMYYYY = selectedDate
    ? moment(selectedDate, "YYYY-MM-DD").format("DD/MM/YYYY")
    : "";

  /* ───────────────────────────────────────────
     2.  fetch unavailable, then decide          */
  useEffect(() => {
    const fetchUnavailable = async () => {
      setLoading(true);
      try {
        // Get the service ID - ensure it's treated as a number if needed
        let serviceId = service.serviceId || service.id;
        
        // If the service comes from a search result, it might have different property names
        if (!serviceId && service.serviceId === undefined && service.id === undefined) {
          if (service._id) {
            serviceId = service._id;
          } else {
            // Try to find any property that could be the ID
            const possibleIdFields = Object.keys(service).filter(key => 
              key.toLowerCase().includes('id') || key === '_id'
            );
            
            if (possibleIdFields.length > 0) {
              serviceId = service[possibleIdFields[0]];
            }
          }
        }
        
        if (!serviceId) {
          throw new Error('Could not determine service ID');
        }
        
        // If ID is not numeric but backend expects numeric, try to parse it
        // This can happen with MongoDB ObjectIds or UUIDs which need to be converted
        if (typeof serviceId === 'string' && serviceId.includes('-')) {
          // This is likely a UUID, try to extract a numeric portion or use a different field
          console.log("Warning: ID appears to be UUID format, but backend may expect numeric ID");
        }
        
        console.log(`Fetching schedule for service ID: ${serviceId}`);
        
        // Add city parameter if needed (as shown in your API docs)
        const params = {};
        if (route.params.city) {
          params.city = route.params.city;
        }
        
        const res = await axios.get(
          `${API_BASE_URL}/service/${serviceId}/schedule`,
          {
            params,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        console.log("Service schedule response:", JSON.stringify(res.data, null, 2));
        
        // API returns { busyDates: [] } in ISO format (YYYY-MM-DD)
        const busyDates = res.data.data.busyDates || [];
        
        // Store the dates in ISO format since that's what the calendar uses
        setUnavailableDates(busyDates);

        /* decide default: today only if NOT blocked */
        if (!busyDates.includes(todayISO)) {
          setSelectedDate(todayISO);
        }
      } catch (err) {
        console.error("Failed to fetch unavailable dates:", err);
        Alert.alert("Error", err.response?.data?.message || "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchUnavailable();
  }, []);

  /* ───────────────────────── calendar marks */
  const markedDates = {};

  // blocked days - no need to convert, API now returns ISO format
  unavailableDates.forEach((isoDate) => {
    markedDates[isoDate] = {
      disabled: true,
      disableTouchEvent: true,
      marked: true,
      dotColor: "red",
    };
  });

  // selected day – only if it's not disabled
  if (selectedDate && !markedDates[selectedDate]?.disabled) {
    markedDates[selectedDate] = {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: Colors.secondary,
      selectedTextColor: "#fff",
    };
  }

  // dot under "today" (secondary colour) when it's free
  if (todayISO !== selectedDate && !markedDates[todayISO]?.disabled) {
    markedDates[todayISO] = {
      ...(markedDates[todayISO] || {}),
      marked: true,
      dotColor: Colors.secondary,
    };
  }

  /* ───────────────────────── render */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: hp(10) }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* chosen service card */}
        <View style={styles.serviceInfoCont}>
          <Text style={styles.title}>Choosed Service</Text>
          {/* if follow up order, show the follow up service */}
          <ServiceItem service={service} />
        </View>

        <Text style={styles.title}>Pick an Appointment</Text>

        <Calendar
          minDate={todayISO}
          maxDate={maxDateISO}
          markedDates={markedDates}
          onDayPress={({ dateString }) => {
            if (markedDates[dateString]?.disabled) {
              Alert.alert("Unavailable", "This date is not available.");
              return;
            }
            setSelectedDate(dateString);
          }}
          theme={{
            todayTextColor: Colors.secondary,
            arrowColor: Colors.primary,
          }}
        />

        {/* legend */}
        <View style={styles.labelsCont}>
          <View style={styles.labelCont}>
            <Entypo name="dot-single" size={20} color="red" />
            <Text style={styles.labelText}>Busy Days</Text>
          </View>
          <View style={styles.labelCont}>
            <Ionicons name="ellipse" size={15} color={Colors.secondary} />
            <Text style={styles.labelText}>Choosed Day</Text>
          </View>
          <View style={styles.labelCont}>
            <Entypo name="dot-single" size={20} color={Colors.secondary} />
            <Text style={styles.labelText}>Today</Text>
          </View>
        </View>

        {/* checkout button */}
        <Button
          onPress={() =>
            navigation.navigate("Checkout", {
              service,
              date: selectedDateInDDMMYYYY,
            })
          }
          disabled={!selectedDate}
        >
          Go To Checkout
        </Button>
      </View>
    </ScrollView>
  );
}

/* ───────── styles (unchanged) */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  serviceInfoCont: { marginBottom: hp(2) },
  labelsCont: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "rgb(230, 230, 230)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: hp(2),
    marginBottom: hp(4),
  },
  labelCont: { flexDirection: "row", alignItems: "center", gap: 3 },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, marginBottom: 20, fontWeight: "bold" },
});
