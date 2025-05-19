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
import Price from "../../../components/Price";
import { AuthContext } from "../../../context/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function PickAppointment({ navigation, route }) {
  const { token } = useContext(AuthContext);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const order = route.params.order;
  const followUpService = order.followUpService;
  
  console.log(followUpService.id);


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
        const res = await axios.get(
          `${API_BASE_URL}/service/${followUpService.id}/schedule`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const list = res.data.data.busyDates || [];
        setUnavailableDates(list);

        /* decide default: today only if NOT blocked */
        const todayDDMMYYYY = moment().format("DD/MM/YYYY");
        if (!list.includes(todayDDMMYYYY)) {
          setSelectedDate(todayISO);
        }
      } catch (err) {
        console.error("Failed to fetch unavailable dates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnavailable();
  }, []);

  /* ───────────────────────── calendar marks */
  const markedDates = {};

  // blocked days
  unavailableDates.forEach((ddMMYYYY) => {
    const [d, m, y] = ddMMYYYY.split("/");
    markedDates[`${y}-${m}-${d}`] = {
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
          <Text style={styles.title}>Follow-up Service</Text>
          <View style={styles.serviceCard}>
            <View>
              <Text style={styles.serviceName}>{followUpService.nameEN}</Text>
              <Text style={styles.serviceDesc}>{followUpService.descriptionEN}</Text>
              <View style={styles.serviceDetails}>
                <View >
                  <Text style={styles.serviceProvider}>{order.serviceProvider.username} - {order.serviceProvider.usernameAR}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Order ID: </Text>
                  <Text style={styles.value}>#{order.id.substring(0, 7)}</Text>
                </View>
                <View style={styles.row}>
                  <Price price={order.followUpService.price} header="Estimated Price" size={wp(3.5)} />
                </View>
              </View>
            </View>
          </View>
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
            navigation.navigate("CheckoutScreenFUS", {
              order,
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
  serviceInfoCont: { 
    marginBottom: hp(2) 
  },
  serviceCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceProvider: {
    fontSize: wp(3.5),
    color: "#666",
    marginBottom: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  serviceName: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 6,
  },
  serviceDesc: {
    fontSize: wp(3.5),
    color: "#555",
    marginBottom: 12,
  },
  serviceDetails: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    // justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: wp(3.5),
    color: "#666",
    fontWeight: "bold",
    fontWeight: "bold",
  },
  value: {
    fontSize: wp(3.5),
    color: "#666",
  },
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
  labelText: { fontSize: wp(3.2) },
});
