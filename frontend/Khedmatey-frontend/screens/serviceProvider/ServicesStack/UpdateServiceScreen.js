import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../../constants/styles";
import Button from "../../../components/UI/Button";
import LoadingOverlay from "../../../components/LoadingOverlay";
import SingleSelect from "../../../components/SelectInputs/SingleSelect";
import { serviceCategories } from "../../../constants/data";
import Input from "../../../components/UI/Input";
import { AuthContext } from "../../../context/AuthContext";
import axios from "axios";
import Toast from "react-native-toast-message";
import { ServicesContext } from "../../../context/ServicesContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function UpdateServiceScreen({ navigation, route }) {
  const { token } = useContext(AuthContext);
  const { service } = route.params; // e.g. service = { serviceId, nameEN, nameAR, price, etc. }
  const { updateService, activeCategoryId } = useContext(ServicesContext);

  const [formState, setFormState] = useState({
    categoryId: { value: activeCategoryId, isValid: true },
    nameEN: { value: service.nameEN, isValid: true },
    nameAR: { value: service.nameAR, isValid: true },
    workersNeeded: {
      value: service.workersNeeded,
      isValid: true,
    },
    price: {
      value: service.price,
      isValid: true,
      isTBD: service.price === "TBD",
    },
  });

  const [backendError, setBackendError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        isValid: true,
      },
    }));
    setBackendError("");
  };

  const toggleTBD = () => {
    setFormState((prev) => ({
      ...prev,
      price: {
        ...prev.price,
        isTBD: !prev.price.isTBD,
        value: !prev.price.isTBD ? "TBD" : "",
        isValid: true,
      },
    }));
  };

  const handleUpdateService = async () => {
    const isValidCategory = !!formState.categoryId.value;
    const isValidNameEN = formState.nameEN.value.trim().length > 0;
    const isValidNameAR = formState.nameAR.value.trim().length > 0;

    // workersNeeded must be ≥ 1 numeric
    const workersStr = formState.workersNeeded.value.trim();
    const workersNum = parseInt(workersStr, 10);
    const isValidWorkers =
      !isNaN(workersNum) && workersNum >= 1 && /^\d+$/.test(workersStr);

    const isValidPrice = formState.price.value.trim().length > 0;

    const allValid =
      isValidCategory &&
      isValidNameEN &&
      isValidNameAR &&
      isValidWorkers &&
      isValidPrice;

    if (!allValid) {
      setFormState((prev) => ({
        ...prev,
        categoryId: { ...prev.categoryId, isValid: isValidCategory },
        nameEN: { ...prev.nameEN, isValid: isValidNameEN },
        nameAR: { ...prev.nameAR, isValid: isValidNameAR },
        workersNeeded: { ...prev.workersNeeded, isValid: isValidWorkers },
        price: { ...prev.price, isValid: isValidPrice },
      }));
      return;
    }

    try {
      setLoading(true);

      // parse the numeric
      const workersNeeded = parseInt(formState.workersNeeded.value, 10);

      await axios.patch(
        `${API_BASE_URL}/service/${service.serviceId}`,
        {
          categoryId: formState.categoryId.value,
          nameEN: formState.nameEN.value,
          nameAR: formState.nameAR.value,
          workersNeeded: formState.workersNeeded.value,
          price: formState.price.value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Then update the local context
      updateService({
        serviceId: service.serviceId,
        categoryId: formState.categoryId.value,
        nameEN: formState.nameEN.value,
        nameAR: formState.nameAR.value,
        price: formState.price.value,
        workersNeeded: formState.workersNeeded.value,
      });

      Toast.show({
        type: "success",
        text1: "Service updated successfully!",
        visibilityTime: 2000,
        topOffset: hp(7),
      });
      navigation.goBack();
    } catch (err) {
      setBackendError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainCont}>
      <View style={styles.formCont}>
        <SingleSelect
          label="Select a category"
          placeholder="Choose your service category"
          data={serviceCategories}
          value={formState.categoryId.value}
          onChange={(item) => handleInputChange("categoryId", item.value)}
          isInvalid={!formState.categoryId.isValid}
          errorMessage="Category is required"
        />

        <Input
          label="Service description (English)"
          placeholder="Enter your service description in English"
          keyboardType="default"
          onUpdateValue={(value) => handleInputChange("nameEN", value)}
          value={formState.nameEN.value}
          labelFontSize={wp(3.8)}
          labelColor="#6F6F6F"
          isInvalid={!formState.nameEN.isValid}
          errorMessage="English description is required"
        />

        <Input
          label="Service description (Arabic)"
          placeholder="Enter your service description in Arabic"
          keyboardType="default"
          onUpdateValue={(value) => handleInputChange("nameAR", value)}
          value={formState.nameAR.value}
          labelFontSize={wp(3.8)}
          labelColor="#6F6F6F"
          isInvalid={!formState.nameAR.isValid}
          errorMessage="Arabic description is required"
        />

        {/* NEW: number of workers needed */}
        <Input
          label="Number of Workers Needed"
          placeholder="Minimum number of workers needed"
          keyboardType="numeric"
          onUpdateValue={(value) => handleInputChange("workersNeeded", value)}
          value={formState.workersNeeded.value}
          labelFontSize={wp(3.8)}
          labelColor="#6F6F6F"
          isInvalid={!formState.workersNeeded.isValid}
          errorMessage="Workers needed must be a number ≥ 1"
        />

        <Input
          label="Service price"
          placeholder="Enter price"
          keyboardType="default"
          value={formState.price.value}
          onUpdateValue={(value) => handleInputChange("price", value)}
          isReadOnly={formState.price.isTBD}
          labelFontSize={wp(3.8)}
          labelColor="#6F6F6F"
          isInvalid={!formState.price.isValid}
          errorMessage="Price is required"
        />

        <View style={styles.switchRow}>
          <Text style={{ fontSize: wp(3.4), color: "#6F6F6F" }}>
            To Be Determined Price?
          </Text>
          <Switch
            value={formState.price.isTBD}
            onValueChange={toggleTBD}
            trackColor={{ true: Colors.primary }}
            thumbColor={Colors.background}
          />
        </View>
      </View>

      {backendError ? (
        <Text style={styles.backendError}>{backendError}</Text>
      ) : null}

      <Button cusStyles={styles.addServiceButton} onPress={handleUpdateService}>
        Update Service
      </Button>
      {loading && <LoadingOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    flex: 1,
    paddingTop: hp(3),
    backgroundColor: Colors.background,
    padding: 30,
  },
  formCont: {
    gap: hp(1),
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addServiceButton: {
    marginTop: hp(4),
  },
  backendError: {
    color: "red",
    fontSize: wp(4),
    marginTop: 8,
    textAlign: "center",
  },
});
