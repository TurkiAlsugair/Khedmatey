import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { prevOrderDetails } from "../../../utility/order";
import Price from "../../../components/Price";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Colors, ORDER_STATUS_STYLES } from "../../../constants/styles";
import Button from "../../../components/UI/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import FeedbackModal from "../../../components/Modals/FeedbackModal";
import ComplaintModal from "../../../components/Modals/ComplaintModal";

export default function PreviousOrderScreen({ navigation, route }) {
  const { orderId } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const insets = useSafeAreaInsets();
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [complaintModalVisible, setComplaintModalVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: `#${orderId}`,
    });
  }, [orderId, navigation]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await prevOrderDetails(orderId);
        setOrder(data);
        setError("");
      } catch (err) {
        setError("Failed to fetch invoice details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [orderId]);

  const handleFeedbackSuccess = (feedback) => {
    setOrder(prev => ({
      ...prev,
      Feedback: feedback
    }));
  };

  const handleComplaintSuccess = (complaint) => {
    setOrder(prev => ({
      ...prev,
      complaint: complaint
    }));
  };

  // Check if bottom container should be shown
  const shouldShowBottomContainer = () => {
    if (!order) return false;
    
    // Always show bottom container for INVOICED (for payment option)
    if (order.status !== "PAID") return true;
    
    // If status is PAID, only show if feedback or complaint options are available
    return (!order.Feedback || !order.complaint);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error || !order) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red" }}>{error || "No data found."}</Text>
      </View>
    );
  }

  const total = order.details.reduce((sum, item) => sum + parseFloat(item.Price), 0);
  const status = order.status === "PAID" ? "PAID" : "INVOICED";
  const statusStyles = ORDER_STATUS_STYLES[status] || {};
  const mainTitle = status === "PAID" ? "Receipt" : "Invoice";
  const detailsTitle = status === "PAID" ? "Receipt Details" : "Invoice Details";

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingBottom: shouldShowBottomContainer() ? hp(15) : 0 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, ...styles.container }}>
        <Text style={[styles.invoiceTitle, { color: statusStyles.text, backgroundColor: statusStyles.bg, borderRadius: 8, padding: 8 }]}> 
          {status}
        </Text>
        <View style={styles.invoiceBox}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{mainTitle}</Text>
          </View>
          {/* Meta Data */}
          <View>
            <Text style={styles.serviceProvider}>{order.serviceProvider?.username} - {order.serviceProvider?.usernameAR}</Text>
          </View>
          <View style={styles.metaRowMain}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Order ID: </Text>
              <Text style={styles.metaValue}>#{orderId}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice ID: </Text>
              <Text style={styles.metaValue}>#{order.id}</Text>
            </View>
          </View>
          <View style={styles.seperator}></View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Worker: </Text>
            <Text style={styles.metaValue}>{order.worker?.username}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Phone Number: </Text>
            <Text style={styles.metaValue}> {order.worker?.phoneNumber}</Text>
          </View>
          <View style={styles.seperator}></View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Customer: </Text>
            <Text style={styles.metaValue}>{order.customer?.username}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Phone Number: </Text>
            <Text style={styles.metaValue}>{order.customer?.phoneNumber}</Text>
          </View>

          <View style={styles.seperator}></View>

          {/* Invoice/Receipt Details */}
          <Text style={styles.sectionTitle}>{detailsTitle}</Text>
          {order.details.map((item, idx) => (
            <View key={idx} style={styles.invoiceRow}>
              <Text style={styles.detailText}>{item.nameEN} - {item.nameAR}</Text>
              <Price price={item.Price} size={wp(3.5)} />
            </View>
          ))}
          <View style={styles.bottomSummaryRow}>
            <Price price={total.toFixed(2)} size={wp(4)} header="Total" />
            <Text style={styles.dateLabel}>Date: {order.date}</Text>
          </View>
          
          {/* Feedback Section (if exists) */}
          {order.Feedback && (
            <>
              <View style={styles.seperator}></View>
              <Text style={styles.sectionTitle}>Your Feedback</Text>
              <View style={styles.feedbackContainer}>
                <View style={styles.ratingRow}>
                  <Text style={styles.feedbackLabel}>Rating:</Text>
                  <View style={styles.starsContainer}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons 
                        key={i}
                        name="star" 
                        size={18} 
                        color={i < parseInt(order.Feedback.rate) ? '#FFD700' : '#ddd'} 
                        style={{ marginHorizontal: 2 }}
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.reviewContainer}>
                  <Text style={styles.feedbackLabel}>Review:</Text>
                  <Text style={styles.reviewText}>{order.Feedback.review}</Text>
                </View>
                <Text style={styles.feedbackDate}>Submitted on: {order.Feedback.date}</Text>
              </View>
            </>
          )}
          
          {/* Complaint Section (if exists) */}
          {order.complaint && (
            <>
              <View style={styles.seperator}></View>
              <Text style={styles.sectionTitle}>Your Complaint</Text>
              <View style={styles.complaintContainer}>
                <View style={styles.complaintContent}>
                  <Text style={styles.complaintText}>{order.complaint.description}</Text>
                </View>
                <Text style={styles.complaintDate}>Submitted on: {order.complaint.date}</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
      
      {shouldShowBottomContainer() && (
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + hp(1) }]}>
         
         {status !== "PAID" && (
            <View style={styles.bottomActionRow}>
              <Price price={total.toFixed(2)} size={wp(5)} header="Total" cusStyles={styles.bottomPrice} />
              <Button cusStyles={styles.payNowBtn} onPress={() => {/* handle pay now */}}>
                Pay Now
              </Button>
            </View>
          )}

          {/* Show feedback and complaint options for both PAID and INVOICED statuses */}
          {(!order.Feedback || !order.complaint) && (
            <View style={styles.actionsContainer}>
              {!order.Feedback && !order.complaint && (
                <>
                  <Button 
                    cusStyles={styles.feedbackBtn} 
                    onPress={() => setFeedbackModalVisible(true)}
                  >
                    Rate & Review
                  </Button>
                  
                  <Button 
                    cusStyles={styles.complaintBtn} 
                    onPress={() => setComplaintModalVisible(true)}
                  >
                    Raise Complaint
                  </Button>
                </>
              )}
              
              {!order.Feedback && order.complaint && (
                <Button 
                  cusStyles={[styles.singleBtn, { backgroundColor: Colors.primary }]} 
                  onPress={() => setFeedbackModalVisible(true)}
                >
                  Rate & Review
                </Button>
              )}
              
              {order.Feedback && !order.complaint && (
                <Button 
                  cusStyles={styles.singleBtn} 
                  onPress={() => setComplaintModalVisible(true)}
                >
                  Raise Complaint
                </Button>
              )}
            </View>
          )}



        </View>
      )}
      
      {/* Modals */}
      <FeedbackModal 
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        orderId={orderId}
        onSuccess={handleFeedbackSuccess}
      />
      
      <ComplaintModal 
        visible={complaintModalVisible}
        onClose={() => setComplaintModalVisible(false)}
        orderId={orderId}
        onSuccess={handleComplaintSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    padding: 20,
    alignItems: "center",
    paddingBottom: hp(10),
  },
  title: {
    fontSize: wp(5),
    fontWeight: "bold",
    // color: "#222",
    
  },
  titleContainer: {
    borderBottomWidth: 1,
    borderColor: "black",
    paddingBottom: hp(0.3),
    marginBottom: hp(2),
    alignSelf:"center"
  },
  serviceProvider: {
    fontSize: wp(4.2),
    fontWeight: "bold",
    color: "#444",
    marginBottom: hp(2),
    textAlign:"center"
  },
  seperator: {
    height: 1,
    backgroundColor: "#ccc",
    width: "100%",
    marginVertical: hp(2),
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  invoiceBox: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 0 },
    marginTop: hp(2),
  },
  orderId: {
    fontSize: wp(4.2),
    fontWeight: "bold",
    color: "#222",
    marginBottom: hp(1),
    textAlign: "left",
  },
  invoiceTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",

    // marginBottom: hp(2),
  },
  metaRowMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    // marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    // justifyContent: "space-between",
    // marginBottom: 6,
  },
  metaLabel: {
    fontWeight: "bold",
    color: "#444",
    fontSize: wp(4),
  },
  metaValue: {
    color: "#444",
    fontSize: wp(4),
    // flexShrink: 1,
    // textAlign: "right",
  },
  sectionTitle: {
    fontSize: wp(5),
    fontWeight: "600",
    marginVertical: hp(1),
    color: "#444",
  },
  invoiceRow: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    gap:hp(1),
    borderBottomWidth: 0.2,
    borderColor: "#ccc",
    padding: hp(1),
  },
  detailText: {
    fontSize: wp(3.7),
    color: "#666",
    flex: 1,
  },
  bottomSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp(2),
    paddingTop: hp(1),
    // borderTopWidth: 1,
    // borderTopColor: "#ccc",
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: wp(4.2),
    color: "#222",
  },
  dateLabel: {
    fontSize: wp(4),
    color: "#666",
    marginLeft: 10,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: hp(1),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomPrice: {
    marginBottom: hp(1.5),
  },
  payNowBtn: {
    width: "100%",
    marginBottom: hp(1),
    backgroundColor: ORDER_STATUS_STYLES["PAID"].text,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  feedbackBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: Colors.primary,
  },
  complaintBtn: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#777777',
  },
  singleBtn: {
    width: '100%',
    backgroundColor: '#777777',
  },
  // Feedback styles
  feedbackContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  feedbackLabel: {
    fontWeight: 'bold',
    fontSize: wp(3.7),
    color: '#444',
  },
  reviewContainer: {
    marginBottom: 8,
  },
  reviewText: {
    fontSize: wp(3.5),
    color: '#555',
    fontStyle: 'italic',
    marginTop: 4,
  },
  feedbackDate: {
    fontSize: wp(3.2),
    color: '#777',
    textAlign: 'right',
  },
  // Complaint styles
  complaintContainer: {
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    padding: 12,
  },
  complaintContent: {
    marginBottom: 8,
  },
  complaintText: {
    fontSize: wp(3.5),
    color: '#555',
    fontStyle: 'italic',
  },
  complaintDate: {
    fontSize: wp(3.2),
    color: '#777',
    textAlign: 'right',
  },
  bottomActionRow: {
    width: '100%',
    marginBottom: hp(1),
  },
});
