import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../../constants/styles";
import Input from "../../../components/UI/Input";
import Button from "../../../components/UI/Button";
import Price from "../../../components/Price";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../../context/AuthContext";
import SingleSelect from "../../../components/SelectInputs/SingleSelect";
import { serviceCategories } from "../../../constants/data";
import { updateStatus } from "../../../utility/order";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function SendFollowUpServiceScreen() {
  const { token } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const { invoice, order, onFinished } = route.params;

  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    categoryId: { value: null, isValid: true },
    nameEN: { value: "", isValid: true },
    nameAR: { value: "", isValid: true },
    descriptionEN: { value: "", isValid: true },
    descriptionAR: { value: "", isValid: true },
    price: { value: "" || "", isValid: true },
    notes: { value: "", isValid: true },
  });
  const [backendError, setBackendError] = useState("");

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: {
        value,
        isValid: true,
      },
    }));
    setBackendError("");
  };

  const validateForm = () => {
    const updated = {
      categoryId: {
        ...formState.categoryId,
        isValid: formState.categoryId.value !== null,
      },
      nameEN: {
        ...formState.nameEN,
        isValid: formState.nameEN.value.trim() !== "",
      },
      nameAR: {
        ...formState.nameAR,
        isValid: formState.nameAR.value.trim() !== "",
      },
      descriptionEN: {
        ...formState.descriptionEN,
        isValid: formState.descriptionEN.value.trim() !== "",
      },
      descriptionAR: {
        ...formState.descriptionAR,
        isValid: formState.descriptionAR.value.trim() !== "",
      },
      price: {
        ...formState.price,
        isValid:
          formState.price.value.trim() !== "" && !isNaN(formState.price.value),
      },
      notes: {
        ...formState.notes,
        isValid: true, // Notes are optional
      },
    };
    setFormState(updated);
    return Object.values(updated).every((field) => field.isValid);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // update the request status to FINISHED, use updateStatus utility
      await updateStatus(token, order.id, "FINISHED");
     
      await axios.patch(
        `${API_BASE_URL}/request/${order.id}/invoice`,
        {
          // since the backend expects it items rather than details
          items: invoice.details.map(item => ({
            nameAR: item.nameAR,
            nameEN: item.nameEN,
            // expects it to be a number
            price: parseFloat(item.price)
          }))
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await axios.post(
        `${API_BASE_URL}/followupService`,
        {
          requestId: order.id,
          nameAR: formState.nameAR.value,
          nameEN: formState.nameEN.value,
          descriptionAR: formState.descriptionAR.value,
          descriptionEN: formState.descriptionEN.value,
          // since backend expects a number
          categoryId: parseInt(formState.categoryId.value),
          price: formState.price.value,
          notes: formState.notes.value.trim() || "No Notes",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onFinished();
      navigation.goBack();
    } catch (error) {
      console.log(error);
      setBackendError(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const confirmAndSubmit = () => {
    Alert.alert(
      "Confirm Submission",
      "Are you sure you want to submit this follow-up service?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: handleSubmit },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.container]}>
      <Text style={styles.title}>Current Invoice</Text>
      <View style={styles.contentBox}>
        {invoice.details && invoice.details.length > 0 ? (
          <>
            {invoice.details.map((item, idx) => (
              <View key={idx} style={styles.invoiceRow}>
                <Text style={styles.sectionText}>
                  {item.nameEN} - {item.nameAR}
                </Text>
                <Price price={item.price} size={wp(3.5)} />
              </View>
            ))}
            <View style={styles.bottomSummaryRow}>
              <Text style={styles.sectionText}>
                <Price
                  price={invoice.details
                    .reduce((acc, item) => acc + parseFloat(item.price), 0)
                    .toFixed(2)}
                  size={wp(3.5)}
                  header="Total"
                />
              </Text>
              <Text style={styles.sectionText}>
                <Text style={styles.bold}>Date:</Text> {invoice.date}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.sectionText}>No invoice details.</Text>
        )}
      </View>

      <Text style={styles.title}>Add Follow-Up Service</Text>

      <SingleSelect
        label="Select a category"
        placeholder="Choose category"
        data={serviceCategories}
        value={formState.categoryId.value}
        onChange={(item) => handleInputChange("categoryId", item.value)}
        isInvalid={!formState.categoryId.isValid}
        errorMessage="Category is required"
      />

      <Input
        label="Name EN"
        placeholder="Enter English name"
        value={formState.nameEN.value}
        onUpdateValue={(value) => handleInputChange("nameEN", value)}
        isInvalid={!formState.nameEN.isValid}
        errorMessage="English name is required"
      />
      <Input
        label="Name AR"
        placeholder="Enter Arabic name"
        value={formState.nameAR.value}
        onUpdateValue={(value) => handleInputChange("nameAR", value)}
        isInvalid={!formState.nameAR.isValid}
        errorMessage="Arabic name is required"
      />
      <Input
        label="Description EN"
        placeholder="Enter English description"
        value={formState.descriptionEN.value}
        onUpdateValue={(value) => handleInputChange("descriptionEN", value)}
        isInvalid={!formState.descriptionEN.isValid}
        errorMessage="English description is required"
      />
      <Input
        label="Description AR"
        placeholder="Enter Arabic description"
        value={formState.descriptionAR.value}
        onUpdateValue={(value) => handleInputChange("descriptionAR", value)}
        isInvalid={!formState.descriptionAR.isValid}
        errorMessage="Arabic description is required"
      />
      <Input
        label="Price"
        placeholder="Enter price"
        value={formState.price.value}
        onUpdateValue={(value) => handleInputChange("price", value)}
        isInvalid={!formState.price.isValid}
        errorMessage="Price must be a number"
      />
      <Input
        label="Notes"
        placeholder="Enter any additional notes"
        value={formState.notes.value}
        onUpdateValue={(value) => handleInputChange("notes", value)}
        isInvalid={!formState.notes.isValid}
        multiline={true}
        numberOfLines={3}
      />

      {backendError ? (
        <Text style={{ color: "red", marginBottom: 10 }}>{backendError}</Text>
      ) : null}

      <Button onPress={confirmAndSubmit} cusStyles={{ marginTop: hp(2) }}>
        Send Follow-Up Service
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: hp(10),
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: wp(5),
    fontWeight: "bold",
    marginVertical: hp(2),
    color: "#222",
  },
  contentBox: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 0 },
    gap: hp(2.2),
  },
  sectionText: {
    fontSize: wp(3.5),
    color: "#666",
    paddingVertical: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  invoiceRow: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    borderBottomWidth: 0.2,
    borderColor: "#ccc",
    paddingBottom: hp(1),
  },
  bottomSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
