import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../../constants/styles";
import Button from "../../../components/UI/Button";
import MapView, { Marker } from "react-native-maps";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import Toast from "react-native-toast-message";
import Price from "../../../components/Price";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

export default function CheckoutScreenFUS({ navigation, route }) {
  const { order, date } = route.params;
  const { token } = useContext(AuthContext);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPrevOrderDetails, setShowPrevOrderDetails] = useState(false);
  const [backendError, setBackendError] = useState("");
  
  const followUpService = order.followUpService;

  const handlePlaceOrder = async () => {
    if (loading) return;
    
    setLoading(true);
    setBackendError("");
    
    try {
      // Make API call to create follow-up order
      const response = await axios.patch(
        `${API_BASE_URL}/request/${order.id}/schedule-followup`,
        {
          orderId: order.id,
          date,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
      
      // Show success toast and navigate back to orders list
      Toast.show({
        type: "success",
        text1: "Follow-up order placed successfully!",
        visibilityTime: 2000,
        topOffset: hp(7),
      });
      
      navigation.navigate("CustomerMainTabs");
    } catch (error) {
      console.error("Error placing order:", error);
      setLoading(false);
      setBackendError(
        error.response?.data?.message || "Failed to place your order. Please try again."
      );
    }
  };

//   const handleCancel = () => {
//     Alert.alert(
//       "Cancel Order",
//       "Are you sure you want to cancel placing this order?",
//       [
//         {
//           text: "No",
//           style: "cancel",
//         },
//         {
//           text: "Yes",
//           onPress: () => navigation.goBack(),
//         },
//       ]
//     );
//   };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Order Details</Text>

          {/* Order Info Container */}
          <View style={styles.orderInfoCont}>
            <View>
              <Text style={styles.label} numberOfLines={1}>
                Service: <Text style={styles.labelValue}>{followUpService.nameEN}</Text>
              </Text>
            </View>

            <View>
              <Text style={styles.orderInfoText} numberOfLines={1}>
                Service Provider: {order.serviceProvider.username}
              </Text>
            </View>

            <View style={styles.rowBetween}>
              <Price price={followUpService.price} size={wp(3.5)} header="Estimated Price" isBold={false}/>
              <Text style={styles.orderInfoText}>Date: {date}</Text>
            </View>

            <View>
              <Text style={styles.orderInfoText} numberOfLines={1}>
                * Payment will be made after the work is completed.
              </Text>
            </View>
          </View>

          {/* Previous Order Toggle */}
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => setShowPrevOrderDetails(!showPrevOrderDetails)}
          >
            <Text style={styles.toggleText}>
              {showPrevOrderDetails ? "Hide Previous Order Details" : "Show Previous Order Details"}
            </Text>
            <Ionicons
              name={showPrevOrderDetails ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.primary}
            />
          </TouchableOpacity>

          {/* Previous Order Details */}
          {showPrevOrderDetails && (
            <View style={styles.prevOrderSection}>
              <Text style={styles.prevOrderTitle}>Previous Order #{order.id}</Text>

              {order.invoice && (
                <View style={styles.invoiceContainer}>
                  {order.invoice.details.map((item, index) => (
                    <View key={index} style={styles.invoiceRow}>
                      <Text style={styles.invoiceItem}>
                        {item.nameEN} - {item.nameAR}
                      </Text>
                      <Price price={item.price} size={wp(3.5)} />
                    </View>
                  ))}
                  <View style={styles.totalRow}>
                    <Text style={styles.invoiceItem}>
                      <Price 
                        price={order.invoice.details.reduce(
                          (sum, item) => sum + Number(item.price || 0),
                          0
                        ).toFixed(2)} 
                        size={wp(3.5)} 
                        header="Total" 
                      />
                    </Text>
                    <Text style={styles.invoiceItem}>
                      <Text style={styles.bold}>Date:</Text> {order.invoice.date}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Notes Section */}
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Additional Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Any instructions or requests for the worker…"
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>
          
          {/* Location Section */}
          <Text style={styles.title}>Location</Text>
          <View style={styles.locationCont}>
            <MapView
              style={styles.map}
              scrollEnabled={false}
              region={{
                latitude: order.location.lat || 37.7749,
                longitude: order.location.lng || -122.4194,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{
                  latitude: order.location.lat || 37.7749,
                  longitude: order.location.lng || -122.4194,
                }}
                title="Service Location"
                description={order.location.fullAddress || ""}
              >
                <View style={styles.iconContainer}>
                  <FontAwesome5
                    name="map-marker-alt"
                    size={27}
                    color={Colors.primary}
                  />
                </View>
              </Marker>
            </MapView>
            
            <View style={styles.addressInfo}>
              <Text style={styles.addressText}>
                Address: {order.location.fullAddress || "No Address"}
              </Text>
            </View>
          </View>
          
          {/* Backend Error */}
          {backendError ? (
            <Text style={styles.errorText}>{backendError}</Text>
          ) : null}
          
          {/* Action Buttons */}
          <View style={styles.buttonsCont}>
            <Button
              cusStyles={styles.cancelOrderButton}
              onPress={() => navigation.replace("CustomerMainTabs")}
            >
              Cancel
            </Button>
            
            <Button
              cusStyles={styles.placeOrderButton}
              onPress={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order"}
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20 
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  label: {
    color: "#666",
  },
  labelValue: {
    fontWeight: "700",
    color: "#000",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderInfoCont: {
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderColor: "rgb(212, 212, 212)",
    paddingBottom: 10,
    marginBottom: hp(2),
  },
  orderInfoText: {
    fontSize: wp(3.3),
    color: "#666",
  },
  priceCont: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: wp(3.2),
    color: "#666",
  },
  riyalLogo: {
    width: wp(4),
    height: hp(1.3),
  },
  toggleContainer: {
    flexDirection: "row",
    // justifyContent: "center",
    // alignItems: "center",
    paddingVertical: 10,
    marginBottom: 16,
    // borderBottomWidth: 1,
    // borderColor: "#eee",
  },
  toggleText: {
    color: Colors.primary,
    fontSize: wp(3.5),
    fontWeight: "500",
    marginRight: wp(2),
  },
  prevOrderSection: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  prevOrderTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: wp(3.5),
    color: "#666",
  },
  detailValue: {
    fontSize: wp(3.5),
    color: "#333",
  },
  invoiceContainer: {
    marginTop: hp(1),
    gap: hp(1),
  },
  invoiceTitle: {
    fontSize: wp(3.8),
    fontWeight: "600",
    marginBottom: 8,
    color: "#555",
  },
  invoiceRow: {
    borderBottomWidth: 0.2,
    borderColor: "#ccc",
    paddingBottom: hp(1),
    gap: hp(1),
  },
  invoiceItem: {
    fontSize: wp(3.5),
    color: "#666",
    paddingVertical: 4,
  },
  invoicePrice: {
    fontSize: wp(3.2),
    color: "#666",
  },
  notesContainer: {
    marginBottom: hp(2),
  },
  notesLabel: {
    fontSize: wp(4),
    fontWeight: "600",
    marginBottom: 5,
  },
  notesInput: {
    borderBottomWidth: 1,
    borderColor: "rgb(212, 212, 212)",
    paddingVertical: 8,
    textAlignVertical: "top",
    maxHeight: hp(7),
    fontSize: wp(3.5),
    marginHorizontal: 10,
  },
  locationCont: {
    marginTop: hp(1),
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: hp(25),
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  addressInfo: {
    padding: 20,
    backgroundColor: "#fff",
  },
  addressText: {
    fontSize: wp(3.5),
    color: "#333",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    fontWeight: "bold",
  },
  buttonsCont: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: hp(5.5),
  },
  placeOrderButton: {
    width: "68%",
  },
  cancelOrderButton: {
    backgroundColor: "rgba(224, 1, 1, 0.71)",
    width: "30%",
  },
  invoiceSummary: {
    marginTop: hp(2),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  invoiceSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },
  invoiceSummaryLabel: {
    fontSize: wp(3.8),
    fontWeight: "600",
    color: "#333",
  },
  invoiceSummaryValue: {
    fontSize: wp(3.8),
    fontWeight: "500",
    color: "#444",
  },
  totalRow: {
    marginTop: hp(1),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bold: {
    fontWeight: "600",
  },
});
