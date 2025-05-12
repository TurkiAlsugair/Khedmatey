// utils/orderUtils.js
import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_MOCK_API_BASE_URL;

// Fetch a list of orders for a given role ("CUSTOMER", "WORKER", "SERVICE_PROVIDER")
export const fetchAllOrders = async (token, role) => {
  try {
    // // Map the uppercase role names to the corresponding API paths
    // const rolePathMap = {
    //   "CUSTOMER": "customer",
    //   "WORKER": "worker",
    //   "SERVICE_PROVIDER": "service-provider"
    // };
    
    // // Get the appropriate API path based on the role
    // const apiPath = rolePathMap[role] || role.toLowerCase);
    
    const response = await axios.get(`${API_BASE_URL}/request`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (err) {
    console.error("Failed to fetch all orders:", err);
    throw err;
  }
};

// Fetch details of a single order by request ID
export const fetchOrderDetails = async (token, requestId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/requests/${requestId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (err) {
    console.error("Failed to fetch order details:", err);
    throw err;
  }
};

// Update the status of an order (provide orderId and newStatus)
export const updateStatus = async (token, orderId, newStatus) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/requests/${orderId}`,
      {
        status: newStatus,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (err) {
    console.error("Failed to update order status:", err);
    throw err;
  }
};

export const prevOrderDetails = async (requestId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/requests/${requestId}`
    );
    return response.data.data;
  } catch (err) {
    console.error("Failed to fetch previous order details:", err);
    throw err;
  }
};
