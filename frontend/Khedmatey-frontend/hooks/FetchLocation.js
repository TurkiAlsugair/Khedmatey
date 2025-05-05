import { useEffect } from "react";
import * as Location from "expo-location";
import { getAddressFromCoords } from "../utility/location";

// Here we always fetch the current user location when the app starts and the user can change
// based on his needs, but we can add isUserChosen flag in the location object to skip the
// auto fetch if it is true. We manupulate it whenever we setLocation based on the set approach

export default function useFetchLocation({
  location,
  setLocation,
  setLoading,
  supportedCities = [],
  locationLoading,
}) {
  useEffect(() => {
    if (locationLoading) return;

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

        const locationObject = {
          lat: coords.coords.latitude,
          lng: coords.coords.longitude,
          city: addressDetails.city,
          address: addressDetails.address,
        };

        setLocation(locationObject);

        // Optional: Check if city is supported
        // if (!supportedCities.includes(locationObject.city)) {
        //   navigation.replace("LocationUnsupported");
        // }
      } catch (error) {
        console.log("Error fetching location:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [locationLoading]);
}
