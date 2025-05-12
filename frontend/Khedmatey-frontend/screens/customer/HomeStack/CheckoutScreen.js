import { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../../constants/styles";
import { Image } from "expo-image";
import MapView, { Marker } from "react-native-maps";
import { LocationContext } from "../../../context/LocationContext";
import { AuthContext } from "../../../context/AuthContext";
import { FontAwesome5 } from "@expo/vector-icons";
import Button from "../../../components/UI/Button";
import Toast from "react-native-toast-message";
import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function CheckoutScreen({ navigation, route }) {
  const { location } = useContext(LocationContext);
  const { token, userInfo } = useContext(AuthContext);


  const service = route.params.service;
  const date = route.params.date;

  const [notes, setNotes] = useState("");
  const [backendError, setBackendError] = useState("");

  // Handler for "Place Order" button
  const handlePlaceOrder = async () => {
    // order payload
    const payload = {
      customerId: userInfo.id,
      serviceId: service.serviceId || service.id,
      location: {
        miniAddress: location?.address || "",
        fullAddress: location?.fullAddress || "",
        city: location?.city || "",
        lat: location?.lat,
        lng: location?.lng,
      },
      date,
      notes,
    };

    console.log(payload);

    try {
      setBackendError("");
      const response = await axios.post(
        `${API_BASE_URL}/request`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Toast.show({
        type: "success",
        text1: `Order placed successfully at ${date}`,
        visibilityTime: 2000,
        topOffset: hp(7),
      });

      // Navigate away
      navigation.replace("CustomerMainTabs");
    } catch (error) {
      setBackendError(
        error.response?.data?.message ||
          "Something went wrong while placing order."
      );
    }
  };

  return (
    <ScrollView
      // contentContainerStyle={{ paddingBottom: hp(10) }}
      showsVerticalScrollIndicator={false}
    >
      {/* // <KeyboardAvoidingView
    //   style={{ flex: 1 }}
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    //   keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    // > */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Order Details</Text>

          {/* --- ORDER INFO --- */}
          <View style={styles.orderInfoCont}>
            <View>
              <Text style={styles.label} numberOfLines={1}>
                Service: <Text style={styles.labelValue}>{service.nameEN}</Text>
              </Text>
            </View>

            <View>
              <Text style={styles.orderInfoText} numberOfLines={1}>
                Service Provider: {service.serviceProvider?.username}
              </Text>
            </View>

            <View style={styles.rowBetween}>
              <View style={styles.priceCont}>
                <Text style={styles.price}>Price: </Text>
                {service.price !== "TBD" && (
                  <Image
                    style={styles.riyalLogo}
                    source={require("../../../assets/images/SaudiRiyalSymbol.svg")}
                    contentFit="contain"
                  />
                )}
                <Text style={styles.price}>{service.price}</Text>
              </View>
              <Text style={styles.orderInfoText}>Date: {date}</Text>
            </View>

            <View>
              <Text style={styles.orderInfoText} numberOfLines={1}>
                * Payment will be made after the work is completed.
              </Text>
            </View>
          </View>

          {/* --- NOTES --- */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Additional Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Any instructions or requests for the worker…"
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* --- LOCATION --- */}
          <Text style={styles.title}>Location</Text>
          <View style={styles.locationCont}>
            {!location ? (
              <Text style={styles.noLocationText}>
                No location found. Please pick your location.
              </Text>
            ) : (
              <MapView
                showsUserLocation={false}
                showsMyLocationButton={false}
                style={styles.map}
                scrollEnabled={false}
                region={{
                  latitude: location.lat,
                  longitude: location.lng,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.lat,
                    longitude: location.lng,
                  }}
                  title="Current Location"
                  description={location.fullAddress || ""}
                >
                  <FontAwesome5 
                    name="map-marker-alt" 
                    size={27} 
                    color={Colors.primary} 
                  />
                </Marker>
              </MapView>
            )}

            <View style={styles.addressInfo}>
              <Text style={styles.addressText}>
                Address: {location ? location.address : "No Address"}
              </Text>
              <TouchableOpacity
                style={styles.changeLocationBtn}
                onPress={() => {
                  navigation.navigate("PickFromMap", {
                    restrictCity: location?.city,
                    fromCheckout: true,
                  });
                }}
              >
                <Text style={styles.changeLocationBtnText}>
                  Change Location
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* --- BACKEND ERROR --- */}
          {backendError ? (
            <Text style={styles.errorText}>{backendError}</Text>
          ) : null}

          {/* --- BUTTONS --- */}
          <View style={styles.buttonsCont}>
            <Button
              cusStyles={styles.cancelOrderButton}
              onPress={() => navigation.replace("CustomerMainTabs")}
            >
              Cancel
            </Button>
            <Button
              cusStyles={styles.placeOrderButton}
              onPress={handlePlaceOrder}
            >
              Place Order
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {/* // </KeyboardAvoidingView> */}
    </ScrollView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  label: {
    color: "#666",
  },
  labelValue: {
    fontWeight: "700",
    color: "#000",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderInfoCont: {
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderColor: "rgb(212, 212, 212)",
    paddingBottom: 10,
    marginBottom: hp(2),
  },
  orderInfoText: {
    fontSize: wp(3.3),
    color: "#666",
  },
  priceCont: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: wp(3.2),
    color: "#666",
  },
  riyalLogo: {
    width: wp(4),
    height: hp(1.3),
  },

  // Location Box
  locationCont: {
    marginTop: hp(1),
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  noLocationText: {
    padding: 10,
    color: "#666",
  },
  map: {
    width: "100%",
    height: hp(25),
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  addressInfo: {
    padding: 20,
    backgroundColor: "#fff",
  },
  addressText: {
    fontSize: wp(3.5),
    color: "#333",
    marginBottom: 8,
  },
  changeLocationBtn: {
    alignSelf: "stretch",
    backgroundColor: "#333",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  changeLocationBtnText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "bold",
    alignSelf: "center",
  },

  // Notes
  notesContainer: {
    marginBottom: hp(2),
  },
  notesLabel: {
    fontSize: wp(4),
    fontWeight: "600",
    marginBottom: 5,
  },
  notesInput: {
    borderBottomWidth: 1,
    borderColor: "rgb(212, 212, 212)",
    paddingVertical: 8,
    textAlignVertical: "top",
    maxHeight: hp(7),
    fontSize: wp(3.5),
    marginHorizontal: 10,
  },

  // Error
  errorText: {
    color: "red",
    marginTop: 10,
    fontWeight: "bold",
  },

  // Buttons
  buttonsCont: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: hp(5.5),
  },
  placeOrderButton: {
    width: "68%",
  },
  cancelOrderButton: {
    backgroundColor: "rgba(224, 1, 1, 0.71)",
    width: "30%",
  },
});
