import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { prevOrderDetails } from "../../../utility/order";
import Price from "../../../components/Price";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { Colors, ORDER_STATUS_STYLES } from "../../../constants/styles";

export default function PreviousOrderScreen({ navigation, route }) {
  const { request } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);


  useEffect(() => {
    navigation.setOptions({
      title: `#${request.id}`,
    });
  }, [request.id, navigation]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await prevOrderDetails(request.id);
        setOrder(data);
        setError("");
      } catch (err) {
        setError("Failed to fetch invoice details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [request.id]);

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
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
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
              <Text style={styles.metaValue}>#{request.id}</Text>
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
        </View>
      </ScrollView>
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
  requestId: {
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
});
