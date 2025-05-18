import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../../constants/styles";
import Button from "../../../components/UI/Button";
import IconButton from "../../../components/UI/IconButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';
import Toast from "react-native-toast-message";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Worker card component
const WorkerCard = ({ worker, onDelete, onEdit }) => {
  return (
    <View style={styles.workerCard}>
      <View style={styles.workerIconContainer}>
        <Ionicons name="person" size={24} color={Colors.primary} />
      </View>
      <View style={styles.workerDetails}>
        <Text style={styles.workerName}>{worker.username}</Text>
        <View style={styles.phoneContainer}>
          <Ionicons name="call-outline" size={14} color="#666" style={styles.phoneIcon} />
          <Text style={styles.workerPhone}>{worker.phoneNumber}</Text>
        </View>
        <Text style={styles.workerCity}>{worker.city}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(worker)}>
          <Ionicons name="create-outline" size={22} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(worker)}>
          <Ionicons name="trash-outline" size={22} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function WorkersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userInfo, token } = useContext(AuthContext);
  const [workers, setWorkers] = useState([]);
  const [groupedWorkers, setGroupedWorkers] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("All");
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch workers data
  useEffect(() => {
    fetchWorkers();
  }, []);

  // Focus listener to refresh the list when navigating back from add/edit screens
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchWorkers();
    });

    return unsubscribe;
  }, [navigation]);
  
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Correct URL path: /service-provider/{id}/workers (with 's' at the end)
      const response = await axios.get(
        `${API_BASE_URL}/service-provider/${userInfo.id}/workers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log("Workers response:", response.data);
      
      // Save raw workers data
      setWorkers(response.data.data);
      
      // Process workers for filtering by city
      const processed = processWorkers(response.data.data);
      setGroupedWorkers(processed);
      
    } catch (error) {
      console.error("Error fetching workers:", error);
      setError(error.response?.data?.message || "Failed to load workers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle worker deletion
  const handleDeleteWorker = (worker) => {
    Alert.alert(
      "Delete Worker",
      `Are you sure you want to delete ${worker.username}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteWorker(worker.id)
        }
      ]
    );
  };

  // Delete worker API call
  const deleteWorker = async (workerId) => {
    try {
      setIsDeleting(true);
      
      await axios.delete(
        `${API_BASE_URL}/service-provider/${userInfo.id}/workers/${workerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Show success message
      Toast.show({
        type: "success",
        text1: "Worker deleted successfully",
        visibilityTime: 2000,
        topOffset: hp(7),
      });
      
      // Refresh the worker list
      fetchWorkers();
      
    } catch (error) {
      console.error("Error deleting worker:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to delete worker",
        visibilityTime: 2000,
        topOffset: hp(7),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle worker edit
  const handleEditWorker = (worker) => {
    navigation.navigate("Edit Worker", { worker });
  };
  
  // Process the workers data for display
  const processWorkers = (workersData) => {
    // Handle empty data case
    if (!workersData || workersData.length === 0) {
      return { All: [] };
    }
    
    // Start with "All" category that includes all workers
    const result = { 
      All: workersData.flatMap(cityGroup => cityGroup.workers) 
    };
    
    // Add city-specific groups
    workersData.forEach(cityGroup => {
      result[cityGroup.city] = cityGroup.workers;
    });
    
    return result;
  };

  // Get list of cities for tabs
  const getCityTabs = () => {
    // Start with "All" tab
    const tabs = ["All"];
    
    // Add cities from workers data if available
    if (workers.length > 0) {
      const citiesFromWorkers = workers.map(cityGroup => cityGroup.city);
      tabs.push(...citiesFromWorkers);
    }
    // Otherwise use cities from user info if available
    else if (userInfo?.cities && Array.isArray(userInfo.cities)) {
      tabs.push(...userInfo.cities);
    }
    
    // Return unique tabs
    return [...new Set(tabs)];
  };
  
  // Render city tab
  const renderCityTab = (city) => {
    const isActive = city === selectedCity;
    
    return (
      <TouchableOpacity
        key={city}
        style={[styles.cityTab, isActive && styles.activeCityTab]}
        onPress={() => setSelectedCity(city)}
      >
        <Text style={[styles.cityTabText, isActive && styles.activeCityTabText]}>
          {city}
        </Text>
        {isActive && <View style={styles.activeTabIndicator} />}
      </TouchableOpacity>
    );
  };
  
  // Get workers to display based on selected city
  const getFilteredWorkers = () => {
    return groupedWorkers[selectedCity] || [];
  };

  return (
    <View style={[styles.mainCont, { paddingTop: insets.top + hp(1.5) }]}>
      <View style={styles.titleCont}>
        <Text style={styles.titleText}>Workers</Text>
        <View style={styles.addIconCont}>
          <IconButton
            icon="add"
            size={wp(6.5)}
            color={"white"}
            onPress={() => navigation.navigate("Add Worker")}
          />
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading workers...</Text>
        </View>
      ) : isDeleting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Deleting worker...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchWorkers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* City tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.cityTabsContainer}
            contentContainerStyle={styles.cityTabsContent}
          >
            {getCityTabs().map(city => renderCityTab(city))}
          </ScrollView>
          
          {/* Workers list */}
          {getFilteredWorkers().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color="#999" />
              <Text style={styles.emptyText}>No workers found in {selectedCity}</Text>
            </View>
          ) : (
            <FlatList
              data={getFilteredWorkers()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <WorkerCard 
                  worker={item} 
                  onDelete={handleDeleteWorker}
                  onEdit={handleEditWorker}
                />
              )}
              contentContainerStyle={styles.workersList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    flex: 1,
    paddingTop: hp(1.7),
    backgroundColor: Colors.background,
    padding: 20,
  },
  titleCont: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  titleText: {
    padding: hp(2),
    alignSelf: "center",
    fontSize: wp(7.5),
    fontWeight: "bold",
  },
  addIconCont: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: wp(4),
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    marginBottom: 20,
    fontSize: wp(4),
    color: "#e74c3c",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: wp(4),
  },
  contentContainer: {
    flex: 1,
  },
  cityTabsContainer: {
    maxHeight: 50,
    marginBottom: 15,
  },
  cityTabsContent: {
    paddingHorizontal: 5,
  },
  cityTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    position: 'relative',
  },
  activeCityTab: {
    backgroundColor: 'transparent',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  cityTabText: {
    fontSize: wp(4),
    color: "#666",
    fontWeight: "500",
  },
  activeCityTabText: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 15,
    fontSize: wp(4),
    color: "#999",
    textAlign: "center",
  },
  workersList: {
    paddingBottom: 20,
  },
  workerCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  workerPhone: {
    fontSize: wp(3.5),
    color: "#666",
  },
  workerCity: {
    fontSize: wp(3.5),
    color: Colors.primary,
  },
  moreButton: {
    padding: 5,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  phoneIcon: {
    marginRight: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 5,
  },
  deleteButton: {
    padding: 8,
  },
});
