// utils/orderUtils.js
import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Fetch a list of orders for a given role ("CUSTOMER", "WORKER", "SERVICE_PROVIDER")
export const fetchAllOrders = async (token, role, statuses) => {
  try {
    const hasStatuses = Array.isArray(statuses) && statuses.length > 0;

    const response = await axios.get(`${API_BASE_URL}/request`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: hasStatuses ? { status: statuses } : {},
      paramsSerializer: (params) => {
        if (!params.status) return '';
        return params.status.map((s) => `status=${s}`).join('&');
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
    const response = await axios.get(`${API_BASE_URL}/request/${requestId}`, {
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
      `${API_BASE_URL}/request/${orderId}/status`,
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
