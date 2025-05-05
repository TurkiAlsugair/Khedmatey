import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
} from "react-native";
import MapView from "react-native-maps";
import { LocationContext } from "../../../context/LocationContext";
import { FontAwesome5 } from "@expo/vector-icons";
import { getAddressFromCoords } from "../../../utility/location";

export default function PickFromMap({ navigation }) {
  const { location, setLocation } = useContext(LocationContext);

  const [region, setRegion] = useState({
    latitude: location?.lat || 24.774265,
    longitude: location?.lng || 46.738586,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [currentAddress, setCurrentAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Fetch initial address on mount
  useEffect(() => {
    const fetchInitialAddress = async () => {
      const lat = location?.lat || region.latitude;
      const lng = location?.lng || region.longitude;

      setLoadingAddress(true);
      const addressDetails = await getAddressFromCoords(lat, lng);
      if (addressDetails) {
        setCurrentAddress(addressDetails.address);
      }
      setLoadingAddress(false);
    };

    fetchInitialAddress();
  }, []);

  // Update address when marker stops dragging
  const handleRegionChangeComplete = async (newRegion) => {
    setRegion(newRegion);
    setLoadingAddress(true);
    const addressDetails = await getAddressFromCoords(
      newRegion.latitude,
      newRegion.longitude
    );
    if (addressDetails) {
      setCurrentAddress(addressDetails.address);
    }
    setLoadingAddress(false);
  };

  const confirmLocation = async () => {
    const { latitude, longitude } = region;
    const addressDetails = await getAddressFromCoords(latitude, longitude);
    if (addressDetails) {
      setLocation({
        lat: latitude,
        lng: longitude,
        city: addressDetails.city,
        address: addressDetails.address,
      });
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        showsUserLocation={true}
        showsMyLocationButton={true}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}
      />

      {/* 📍 Fixed marker */}
      <View pointerEvents="none" style={styles.fixedMarker}>
        <FontAwesome5 name="map-marker-alt" size={30} color="black" />
      </View>

      {/* 📦 Floating address preview */}
      <View style={styles.addressPreview}>
        {loadingAddress ? (
          <ActivityIndicator size="small" />
        ) : currentAddress ? (
          <Text style={styles.addressText}>{currentAddress}</Text>
        ) : (
          <Text style={styles.addressText}>Fetching location...</Text>
        )}
      </View>

      {/* ✅ Buttons */}
      <View style={styles.controls}>
        <Button title="Cancel" onPress={() => navigation.goBack()} />
        <Button title="Confirm Location" onPress={confirmLocation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  fixedMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -30,
    zIndex: 10,
  },
  addressPreview: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
  },
  addressText: {
    fontSize: 14,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
});
