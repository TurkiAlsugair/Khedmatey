import { Modal, View, StyleSheet, Alert, Text, ScrollView, TouchableOpacity } from "react-native";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { useState, useEffect } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Price from "../Price";
import { Ionicons } from "@expo/vector-icons";
import IconButton from "../UI/IconButton";

export default function GenerateInvoiceModal({
  visible,
  onClose,
  onSubmit,
  invoice,
  isFollowUpOrder,
  previousInvoice,
}) {
  const [invoiceItems, setInvoiceItems] = useState(
    invoice?.details || []
  );

  const [editingIndex, setEditingIndex] = useState(null);
  const [formState, setFormState] = useState({
    nameEN: { value: "", isValid: true },
    nameAR: { value: "", isValid: true },
    price: { value: "", isValid: true },
  });

  // Reset invoiceItems when modal is opened or invoice changes
  useEffect(() => {
    setInvoiceItems(invoice?.details || []);
  }, [visible, invoice]);

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: {
        value,
        isValid: value.trim() !== "" && (field !== "price" || !isNaN(value)),
      },
    }));
  };

  const validateForm = () => {
    const updated = {
      nameEN: {
        ...formState.nameEN,
        isValid: formState.nameEN.value.trim() !== "",
      },
      nameAR: {
        ...formState.nameAR,
        isValid: formState.nameAR.value.trim() !== "",
      },
      price: {
        ...formState.price,
        isValid:
          formState.price.value.trim() !== "" && !isNaN(formState.price.value),
      },
    };
    setFormState(updated);
    return Object.values(updated).every((field) => field.isValid);
  };

  const handleAddItem = () => {
    if (!validateForm()) return;
    
    const newItem = {
      nameEN: formState.nameEN.value,
      nameAR: formState.nameAR.value,
      price: formState.price.value,
    };

    if (editingIndex !== null) {
      const updatedItems = [...invoiceItems];
      updatedItems[editingIndex] = newItem;
      setInvoiceItems(updatedItems);
      setEditingIndex(null);
    } else {
      setInvoiceItems([...invoiceItems, newItem]);
    }

    // Reset form
    setFormState({
      nameEN: { value: "", isValid: true },
      nameAR: { value: "", isValid: true },
      price: { value: "", isValid: true },
    });
  };

  const handleEditItem = (index) => {
    const item = invoiceItems[index];
    setFormState({
      nameEN: { value: item.nameEN, isValid: true },
      nameAR: { value: item.nameAR, isValid: true },
      price: { value: item.price, isValid: true },
    });
    setEditingIndex(index);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(updatedItems);
    // Reset editing state if the deleted item was being edited
    if (editingIndex === index) {
      setEditingIndex(null);
      setFormState({
        nameEN: { value: "", isValid: true },
        nameAR: { value: "", isValid: true },
        price: { value: "", isValid: true },
      });
    } else if (editingIndex !== null && editingIndex > index) {
      // Adjust editing index if we deleted an item before the one being edited
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setFormState({
      nameEN: { value: "", isValid: true },
      nameAR: { value: "", isValid: true },
      price: { value: "", isValid: true },
    });
    // Do not touch invoiceItems here
  };

  const handleSubmit = () => {
    if (invoiceItems.length === 0) {
      Alert.alert("Error", "Please add at least one invoice item");
      return;
    }
    onSubmit({
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '/'),
      details: invoiceItems,
    });
    onClose();
  };

  const total = invoiceItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView style={{ padding: 20, marginTop: hp(5) }}>
        <View style={{ flex: 1, paddingBottom: hp(10) }}>
          <View style={{ alignSelf: 'flex-start', marginBottom: hp(2) }}>
            <IconButton
              color={"black"}
              size={30}
              icon={"arrow-back"}
              onPress={onClose}
            />
          </View>
        {isFollowUpOrder && previousInvoice?.details?.length > 0 && (
          <View style={styles.prevDetailsBox}>
              <Text style={styles.prevTitle}>Previous Invoice Details</Text>
            {previousInvoice.details.map((item, idx) => (
              <View key={idx} style={styles.invoiceRow}>
                <Text style={styles.prevSectionText}>
                  {item.nameEN} - {item.nameAR}
                </Text>
                <Price price={item.Price} size={wp(3.5)} />
              </View>
            ))}
            <View style={styles.bottomSummaryRow}>
              <Text style={styles.prevSectionText}>
                <Price
                  price={previousInvoice.details
                    .reduce((acc, item) => acc + parseFloat(item.Price), 0)
                    .toFixed(2)}
                  size={wp(3.5)}
                  header="Total"
                />
              </Text>
              <Text style={styles.prevSectionText}>
                <Text style={styles.bold}>Date:</Text> {previousInvoice.date}
              </Text>
            </View>
          </View>
        )}

          <Text style={styles.sectionTitle}>
            {editingIndex !== null ? "Edit Invoice Item" : "Add Invoice Item"}
          </Text>
        <Input
          label="Service description (English)"
          placeholder="Enter description in English"
          onUpdateValue={(value) => handleInputChange("nameEN", value)}
          value={formState.nameEN.value}
          isInvalid={!formState.nameEN.isValid}
          errorMessage="Required"
        />
        <Input
          label="Service description (Arabic)"
          placeholder="Enter description in Arabic"
          onUpdateValue={(value) => handleInputChange("nameAR", value)}
          value={formState.nameAR.value}
          isInvalid={!formState.nameAR.isValid}
          errorMessage="Required"
        />
        <Input
          label="Price"
          placeholder="Enter price"
          keyboardType="numeric"
          onUpdateValue={(value) => handleInputChange("price", value)}
          value={formState.price.value}
          isInvalid={!formState.price.isValid}
          errorMessage="Price must be a number"
        />

          <View style={styles.buttonRow}>
            {editingIndex !== null && (
              <Button
                onPress={handleCancelEdit}
                cusStyles={{
                  width: wp(30),
                  backgroundColor: "#666",
                }}
              >
                Cancel Edit
              </Button>
            )}
            <Button 
              onPress={handleAddItem} 
              cusStyles={{ flex: 1 }}
            >
              {editingIndex !== null ? "Update Item" : "Add Item"}
        </Button>
          </View>

          {invoiceItems.length > 0 && (
            <View style={styles.contentBox}>
              <Text style={styles.sectionTitle}>Invoice Preview</Text>
              {invoiceItems.map((item, index) => (
                <View key={index} style={styles.invoiceRow}>
                  <View style={styles.previewContent}>
                    <Text style={styles.sectionText}>
                      {item.nameEN} - {item.nameAR}
                    </Text>
                    <Price price={item.price} size={wp(3.5)} />
                  </View>
                  <View style={styles.previewActions}>
                    <TouchableOpacity 
                      onPress={() => handleEditItem(index)}
                      disabled={editingIndex !== null}
                    >
                      <Ionicons 
                        name="pencil" 
                        size={20} 
                        color={editingIndex !== null ? "#ccc" : "#666"} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDeleteItem(index)}
                      disabled={editingIndex !== null}
                    >
                      <Ionicons 
                        name="trash" 
                        size={20} 
                        color={editingIndex !== null ? "#ccc" : "#ff4444"} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <View style={styles.bottomSummaryRow}>
                <Text style={styles.sectionText}>
                  <Price price={total.toFixed(2)} size={wp(3.5)} header="Total" />
                </Text>
              </View>
            </View>
          )}

          <View style={styles.buttonRow}>
        <Button
          onPress={onClose}
          cusStyles={{
                width: wp(30),
            backgroundColor: "rgba(224, 1, 1, 0.71)",
          }}
        >
          Cancel
        </Button>
            <Button onPress={handleSubmit} cusStyles={{ flex: 1 }}>
              Submit Invoice
            </Button>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  prevDetailsBox: {
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    gap: hp(1),
  },
  prevTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    marginBottom: hp(1),
  },
  invoiceRow: {
    borderBottomWidth: 0.2,
    borderColor: "#ccc",
    paddingBottom: hp(1),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp(1),
  },
  prevSectionText: {
    fontSize: wp(3.5),
    color: "#666",
    paddingVertical: 4,
  },
  bold: {
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    marginVertical: hp(2),
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
    marginVertical: hp(2),
  },
  previewContent: {
    flex: 1,
  },
  previewActions: {
    flexDirection: "row",
    gap: wp(3),
  },
  sectionText: {
    fontSize: wp(3.5),
    color: "#666",
    paddingVertical: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: hp(2),
    gap: wp(2),
    justifyContent: 'flex-end',
  },
});
