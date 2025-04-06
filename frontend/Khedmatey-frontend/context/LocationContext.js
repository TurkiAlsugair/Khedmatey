import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocationState] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    const loadStoredLocation = async () => {
      try {
        const savedLocation = await AsyncStorage.getItem("userLocation");
        if (savedLocation) {
          setLocationState(JSON.parse(savedLocation));
          console.log("✅ Location loaded from storage");
        }
      } catch (error) {
        console.error("Failed to load location from storage", error);
      } finally {
        setLocationLoading(false);
      }
    };

    loadStoredLocation();
  }, []);

  const setLocation = async (loc) => {
    try {
      setLocationState(loc);
      await AsyncStorage.setItem("userLocation", JSON.stringify(loc));
    } catch (error) {
      console.error("Failed to save location", error);
    }
  };

  return (
    <LocationContext.Provider
      value={{ location, setLocation, locationLoading }}
    >
      {children}
    </LocationContext.Provider>
  );
};
