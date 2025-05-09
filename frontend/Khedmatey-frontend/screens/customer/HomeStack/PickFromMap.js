import React, { useContext, useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import MapView from "react-native-maps";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Location from "expo-location";

import Button from "../../../components/UI/Button";
import IconButton from "../../../components/UI/IconButton";
import { getAddressFromCoords } from "../../../utility/location";
import { Colors } from "../../../constants/styles";
import { LocationContext } from "../../../context/LocationContext";

export default function PickFromMap({ navigation, route }) {
  const { location, setLocation } = useContext(LocationContext);

  // read potential restrictions
  const restrictCity = route.params?.restrictCity || null;
  const fromCheckout = route.params?.fromCheckout || false;

  const mapRef = useRef(null);

  const [region, setRegion] = useState({
    latitude: location?.lat || 24.774265,
    longitude: location?.lng || 46.738586,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [currentCity, setCurrentCity] = useState(null);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    fetchInitialAddress();
  }, []);

  async function fetchInitialAddress() {
    const lat = location?.lat || region.latitude;
    const lng = location?.lng || region.longitude;

    setLoadingAddress(true);
    const addressDetails = await getAddressFromCoords(lat, lng);
    if (addressDetails) {
      setCurrentCity(addressDetails.city);
      setCurrentAddress(addressDetails.address);
    }
    setLoadingAddress(false);
  }

  const handleRegionChangeComplete = async (newRegion) => {
    setRegion(newRegion);
    setLoadingAddress(true);

    const addressDetails = await getAddressFromCoords(
      newRegion.latitude,
      newRegion.longitude
    );
    if (addressDetails) {
      setCurrentCity(addressDetails.city);
      setCurrentAddress(addressDetails.address);
    }
    setLoadingAddress(false);
  };

  const goToUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission not granted");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateToRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    } catch (error) {
      console.log("Error going to user location:", error);
    }
  };

  const confirmLocation = async () => {
    const { latitude, longitude } = region;
    const addressDetails = await getAddressFromCoords(latitude, longitude);
    if (addressDetails) {
      // if from checkout & we have a city restriction
      if (fromCheckout && restrictCity) {
        if (addressDetails.city !== restrictCity) {
          // Different city => show alert & do nothing
          Alert.alert(
            "City Not Allowed",
            `You can't choose a location in "${addressDetails.city}" because your order is restricted to "${restrictCity}".`
          );
          return;
        }
      }

      // Otherwise, allow saving
      setLocation({
        lat: latitude,
        lng: longitude,
        city: addressDetails.city,
        address: addressDetails.address,
        fullAddress: addressDetails.fullAddress,
      });
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        showsUserLocation={true}
        showsMyLocationButton={false}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}
      />

      {/* Fixed marker */}
      <View pointerEvents="none" style={styles.fixedMarker}>
        <FontAwesome5 name="map-marker-alt" size={27} color={Colors.primary} />
      </View>

      {/* Floating address preview */}
      <View style={styles.addressPreview}>
        {loadingAddress ? (
          <ActivityIndicator size="small" />
        ) : currentAddress ? (
          <>
            <View style={styles.myLocationButtonCont}>
              <IconButton
                icon="navigate-outline"
                color="white"
                size={20}
                onPress={goToUserLocation}
              />
            </View>
            <View style={styles.titleCont}>
              <Ionicons
                name="location-outline"
                size={wp(5.5)}
                color={Colors.primary}
              />
              <Text style={styles.titleText}>{currentCity || ""}</Text>
            </View>
            <Text style={styles.addressText}>{currentAddress}</Text>
            <View style={styles.controls}>
              <Button
                cusStyles={styles.buttonStylesCancel}
                cusText={styles.buttonTextStyles}
                onPress={() => navigation.goBack()}
              >
                Cancel
              </Button>
              <Button
                cusStyles={styles.buttonStylesConfirm}
                cusText={styles.buttonTextStyles}
                onPress={confirmLocation}
              >
                Confirm Location
              </Button>
            </View>
          </>
        ) : (
          <Text style={styles.addressText}>Fetching location...</Text>
        )}
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  fixedMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -13,
    marginTop: -30,
    zIndex: 10,
  },
  addressPreview: {
    position: "absolute",
    bottom: hp(5),
    left: wp(3),
    right: wp(3),
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  titleCont: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    paddingBottom: 10,
  },
  titleText: {
    fontSize: wp(4.5),
    fontWeight: "500",
  },
  addressText: {
    fontSize: wp(3.5),
    marginLeft: wp(7),
  },
  myLocationButtonCont: {
    position: "absolute",
    top: hp(-6),
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 3,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  buttonStylesConfirm: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: Colors.primary,
  },
  buttonStylesCancel: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: "rgb(219, 22, 22)",
  },
  buttonTextStyles: {
    fontSize: wp(3.5),
  },
});
