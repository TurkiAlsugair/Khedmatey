import { serviceCategories } from "../constants/data";

// Helper function to get the label by cat Id
export const getCategoryNameById = (id) => {
  return serviceCategories.find((cat) => String(cat.value) === String(id))?.label || "Unknown";
};

