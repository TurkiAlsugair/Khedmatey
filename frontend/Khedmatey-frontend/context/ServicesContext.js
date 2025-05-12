import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { getCategoryNameById } from "../utility/services";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const ServicesContext = createContext();

export const ServicesProvider = ({ children }) => {
  const { token, userInfo } = useContext(AuthContext);
  const [servicesData, setServicesData] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [loadingServices, setLoadingServices] = useState(false);
  const [error, setError] = useState("");

  // // Helper function
  // const getCategoryNameById = (id) => {
  //   return (
  //     serviceCategories.find((cat) => cat.value === id)?.label || "Unknown"
  //   );
  // };

  useEffect(() => {
    if (token) {
      fetchServices();
    }
  }, [token]);

  const fetchServices = async () => {
    try {
      setLoadingServices(true);



      const response = await axios.get(`${API_BASE_URL}/service?spId=${userInfo.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // rawCategories has { id, categoryName, services: [ { id, … }, … ] }
      const rawCategories = response.data.data.data.services;
      console.log("userInfo", rawCategories);
      console.log("rawCategories", rawCategories);
      console.log("response", response.data.data);

      // remap ids into the shape your UI expects
      const shaped = rawCategories.map((cat) => ({
        categoryId: cat.id, // ← rename here
        categoryName: cat.categoryName,
        services: cat.services.map((svc) => ({
          serviceId: svc.id, // ← and here
          nameEN: svc.nameEN,
          nameAR: svc.nameAR,
          price: svc.price,
          // ...any other svc fields you use
        })),
      }));

      setServicesData(shaped);

      // pick a default activeCategoryId as before
      if (!activeCategoryId && shaped.length > 0) {
        setActiveCategoryId(shaped[0].categoryId);
      }

      setError("");
    } catch (err) {
      console.log("Error fetching services:", err);
      setError(err.response?.data?.message || "Failed to fetch services.");
    } finally {
      setLoadingServices(false);
    }
  };

  const addService = (newService) => {
    setServicesData((prev) => {
      // Clone or map the previous categories
      const updated = prev.map((cat) => ({
        ...cat,
        services: [...cat.services],
      }));

      // 1) Find if category already exists
      const catIndex = updated.findIndex(
        (cat) => cat.categoryId === newService.categoryId
      );

      // 2) If it doesn't exist, create it
      if (catIndex === -1) {
        updated.push({
          categoryId: newService.categoryId,
          categoryName: getCategoryNameById(newService.categoryId),
          services: [newService],
        });
      } else {
        // 3) Otherwise, just push the service into that category
        updated[catIndex].services.push(newService);
      }

      return updated;
    });
  };

  const updateService = (updatedService) => {
    // 1) Store the old active category in a local variable
    const oldActiveCat = activeCategoryId;

    setServicesData((prev) => {
      // 2) Clone categories and their services (shallow copy)
      let updated = prev.map((cat) => ({
        ...cat,
        services: [...cat.services],
      }));

      // 3) Remove the old service from all categories
      updated.forEach((cat) => {
        cat.services = cat.services.filter(
          (svc) => svc.serviceId !== updatedService.serviceId
        );
      });

      // 4) Find or create the new category
      const catIndex = updated.findIndex(
        (cat) => cat.categoryId === updatedService.categoryId
      );
      if (catIndex === -1) {
        // Category doesn't exist -> create
        updated.push({
          categoryId: updatedService.categoryId,
          categoryName: getCategoryNameById(updatedService.categoryId),
          services: [updatedService],
        });
      } else {
        // Insert the updated service into that category
        updated[catIndex].services.push(updatedService);
      }

      // 5) Remove any empty categories
      updated = updated.filter((cat) => cat.services.length > 0);

      // 6) Check if the old active category still exists
      const stillHasOldActiveCat = updated.some(
        (cat) => cat.categoryId === oldActiveCat
      );

      // If not, pick the first category (if any left)
      if (!stillHasOldActiveCat && updated.length > 0) {
        setActiveCategoryId(updated[0].categoryId);
      } else if (updated.length === 0) {
        // Optionally, if no categories remain, set activeCategoryId to null
        setActiveCategoryId(null);
      }

      return updated;
    });
  };

  const deleteService = (serviceId, categoryId) => {
    setServicesData((prev) => {
      let updated = prev.map((cat) =>
        cat.categoryId === categoryId
          ? {
              ...cat,
              services: cat.services.filter((s) => s.serviceId !== serviceId),
            }
          : cat
      );

      // Remove empty categories
      updated = updated.filter((cat) => cat.services.length > 0);

      // If the category that was active is gone or empty, switch to first if possible
      const stillHasActiveCat = updated.some(
        (cat) => cat.categoryId === categoryId
      );
      if (!stillHasActiveCat && updated.length > 0) {
        setActiveCategoryId(updated[0].categoryId);
      }

      return updated;
    });
  };

  return (
    <ServicesContext.Provider
      value={{
        servicesData,
        activeCategoryId,
        setActiveCategoryId,
        fetchServices,
        loadingServices,
        error,
        addService,
        updateService,
        deleteService,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};
