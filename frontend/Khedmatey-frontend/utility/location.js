import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const getComponent = (components, types) =>
  components.find((comp) => types.some((type) => comp.types.includes(type)))
    ?.long_name || "";

export const getAddressFromCoords = async (lat, lng) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=en&key=${GOOGLE_MAPS_API_KEY}`
    );

    // Note, we change language based on the user's language

    console.log("Fetching address from Google Maps...");
    const result = response.data.results[0];
    if (!result) return null;

    const components = result.address_components;

    const street = getComponent(components, ["route"]);
    const houseNumber = getComponent(components, ["street_number"]);
    const neighborhood = getComponent(components, [
      "neighborhood",
      "sublocality",
      "sublocality_level_1",
      "administrative_area_level_3",
    ]);
    const city = getComponent(components, ["locality"]);
    const postalCode = getComponent(components, ["postal_code"]);

    const miniAddress = `${street}  ${houseNumber}  ${neighborhood} ${postalCode} `;

    return {
      fullAddress: result.formatted_address,
      address: miniAddress,
      street,
      houseNumber,
      neighborhood,
      city,
    };
  } catch (error) {
    console.error("Failed to fetch address", error);
    return null;
  }
};
