import React, { useState, useEffect, useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  RefreshControl
} from "react-native";
import { Colors } from "../../../constants/styles";
import { Ionicons } from "@expo/vector-icons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import Toast from "react-native-toast-message";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const ComplaintItem = ({ complaint }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <TouchableOpacity 
      style={styles.complaintCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.complaintHeader}>
        <View style={styles.complaintHeaderLeft}>
          <Text style={styles.complaintId}>Complaint #{complaint.id}</Text>
        </View>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={Colors.primary} 
        />
      </View>
      
      <View style={styles.complaintDescription}>
        <Text style={styles.descriptionText}>{complaint.description}</Text>
      </View>
      
      {expanded && (
        <View style={styles.complaintDetails}>
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Service Provider</Text>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color={Colors.primary} />
              <Text style={styles.detailText}>
                {complaint.serviceProvider.username}
                {complaint.serviceProvider.usernameAR && ` - ${complaint.serviceProvider.usernameAR}`}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={16} color={Colors.primary} />
              <Text style={styles.detailText}>{complaint.serviceProvider.phoneNumber}</Text>
            </View>
            {complaint.serviceProvider.email && (
              <View style={styles.detailRow}>
                <Ionicons name="mail-outline" size={16} color={Colors.primary} />
                <Text style={styles.detailText}>{complaint.serviceProvider.email}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color={Colors.primary} />
              <Text style={styles.detailText}>{complaint.request?.customer?.username || "Unknown customer"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={16} color={Colors.primary} />
              <Text style={styles.detailText}>{complaint.request?.customer?.phoneNumber || "No phone number"}</Text>
            </View>
          </View>
          
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Service Info</Text>
            <View style={styles.detailRow}>
              <Ionicons name="construct-outline" size={16} color={Colors.primary} />
              <Text style={styles.detailText}>
                {complaint.request?.service?.nameEN || "Unknown"} 
                {complaint.request?.service?.nameAR && ` - ${complaint.request?.service?.nameAR}`}
              </Text>
            </View>
            {complaint.request?.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color={Colors.primary} />
                <Text style={styles.detailText}>
                  {complaint.request.location.fullAddress}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function ComplaintsScreen() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/admin/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setComplaints(response.data.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch complaints";
      setError(errorMsg);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMsg,
        visibilityTime: 2000,
        topOffset: hp(7),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Complaints ({complaints.length})
        </Text>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error && !refreshing ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchComplaints}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ComplaintItem complaint={item} />}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbox-ellipses-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No complaints found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: hp(1),
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
    // backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  complaintCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: hp(0),
  },
  complaintHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "80%",
  },
  complaintId: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  complaintDescription: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: wp(3.8),
    color: '#333',
    lineHeight: wp(5.5),
  },
  complaintDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 16,
  },
  detailsSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: wp(3.8),
    fontWeight: 'bold',
    color: '#444',
    // marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: wp(3.5),
    color: '#555',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: wp(4),
    color: '#666',
    marginTop: 12,
  },
});
