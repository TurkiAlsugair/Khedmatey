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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function UpdateServiceScreen({ navigation, route }) {
  const { token } = useContext(AuthContext);
  const { service } = route.params; // e.g. service = { serviceId, nameEN, nameAR, price, etc. }
  const { updateService, activeCategoryId } = useContext(ServicesContext);

  const [formState, setFormState] = useState({
    categoryId: { value: activeCategoryId, isValid: true },
    nameEN: { value: service.nameEN, isValid: true },
    nameAR: { value: service.nameAR, isValid: true },
    descriptionEN: { value: service.descriptionEN || "", isValid: true },
    descriptionAR: { value: service.descriptionAR || "", isValid: true },
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
    const isValidDescriptionEN = formState.descriptionEN.value.trim().length > 0;
    const isValidDescriptionAR = formState.descriptionAR.value.trim().length > 0;
    const isValidPrice = formState.price.value.trim().length > 0;

    const allValid =
      isValidCategory &&
      isValidNameEN &&
      isValidNameAR &&
      isValidDescriptionEN &&
      isValidDescriptionAR &&
      isValidPrice;

    if (!allValid) {
      setFormState((prev) => ({
        ...prev,
        categoryId: { ...prev.categoryId, isValid: isValidCategory },
        nameEN: { ...prev.nameEN, isValid: isValidNameEN },
        nameAR: { ...prev.nameAR, isValid: isValidNameAR },
        descriptionEN: { ...prev.descriptionEN, isValid: isValidDescriptionEN },
        descriptionAR: { ...prev.descriptionAR, isValid: isValidDescriptionAR },
        price: { ...prev.price, isValid: isValidPrice },
      }));
      return;
    }

    try {
      setLoading(true);

      await axios.patch(
        `${API_BASE_URL}/service/${service.serviceId}`,
        {
          categoryId: parseInt(formState.categoryId.value, 10),
          nameEN: formState.nameEN.value,
          nameAR: formState.nameAR.value,
          descriptionEN: formState.descriptionEN.value,
          descriptionAR: formState.descriptionAR.value,
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
        descriptionEN: formState.descriptionEN.value,
        descriptionAR: formState.descriptionAR.value,
        price: formState.price.value,
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
          label="Service name (English)"
          placeholder="Enter your service name in English"
          keyboardType="default"
          onUpdateValue={(value) => handleInputChange("nameEN", value)}
          value={formState.nameEN.value}
          labelFontSize={wp(3.8)}
          labelColor="#6F6F6F"
          isInvalid={!formState.nameEN.isValid}
          errorMessage="English name is required"
        />

        <Input
          label="Service name (Arabic)"
          placeholder="Enter your service name in Arabic"
          keyboardType="default"
          onUpdateValue={(value) => handleInputChange("nameAR", value)}
          value={formState.nameAR.value}
          labelFontSize={wp(3.8)}
          labelColor="#6F6F6F"
          isInvalid={!formState.nameAR.isValid}
          errorMessage="Arabic name is required"
        />

        <Input
          label="Service description (English)"
          placeholder="Enter your service description in English"
          keyboardType="default"
          onUpdateValue={(value) => handleInputChange("descriptionEN", value)}
          value={formState.descriptionEN.value}
          labelFontSize={wp(3.8)}
          labelColor="#6F6F6F"
          isInvalid={!formState.descriptionEN.isValid}
          errorMessage="English description is required"
          multiline={true}
          numberOfLines={3}
        />

        <Input
          label="Service description (Arabic)"
          placeholder="Enter your service description in Arabic"
          keyboardType="default"
          onUpdateValue={(value) => handleInputChange("descriptionAR", value)}
          value={formState.descriptionAR.value}
          labelFontSize={wp(3.8)}
          labelColor="#6F6F6F"
          isInvalid={!formState.descriptionAR.isValid}
          errorMessage="Arabic description is required"
          multiline={true}
          numberOfLines={3}
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
