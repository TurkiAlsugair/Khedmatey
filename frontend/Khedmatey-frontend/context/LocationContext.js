import React, { createContext, useState, useEffect } from "react";
import * as Location from "expo-location";
import { getAddressFromCoords } from "../utility/location"; // your helper

export const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Location permission denied");
          setLocation(null);
          return;
        }

        const coords = await Location.getCurrentPositionAsync({});
        const addressDetails = await getAddressFromCoords(
          coords.coords.latitude,
          coords.coords.longitude
        );

        if (!addressDetails?.city) {
          console.log("City not found");
          return;
        }

        const locationObj = {
          lat: coords.coords.latitude,
          lng: coords.coords.longitude,
          city: addressDetails.city,
          address: addressDetails.address,
          fullAddress: addressDetails.fullAddress,
        };

        setLocation(locationObj);
      } catch (error) {
        console.log("Error fetching location:", error);
      } finally {
        setLocationLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{ location, setLocation, locationLoading }}
    >
      {children}
    </LocationContext.Provider>
  );
}
