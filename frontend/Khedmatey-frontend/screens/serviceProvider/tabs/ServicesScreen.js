import { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import IconButton from "../../../components/UI/IconButton";
import Categories from "../../../components/Services/Categories";
import ServicesList from "../../../components/Services/ServicesList";
import { ServicesContext } from "../../../context/ServicesContext";
import { Colors } from "../../../constants/styles";
import { serviceCategories } from "../../../constants/data";

const categories = serviceCategories;

export default function MyServicesScreen({ navigation }) {
  const { servicesData, activeCategoryId, setActiveCategoryId, error } =
    useContext(ServicesContext);

  const selectedCategoryServices = servicesData.find(
    (cat) => cat.categoryId === activeCategoryId
  )?.services;

  return (
    <View style={styles.mainCont}>
      <View style={styles.titleCont}>
        <Text style={styles.titleText}>Services</Text>
        <View style={styles.addIconCont}>
          <IconButton
            icon="add"
            size={wp(6.5)}
            color="white"
            onPress={() => navigation.navigate("Add Service")}
          />
        </View>
      </View>

      {error && <Text style={styles.backendError}>{error}</Text>}

      <Text style={styles.header}>Categories</Text>
      <Categories
        categories={servicesData}
        activeCategoryId={activeCategoryId}
        setActiveCategoryId={setActiveCategoryId}
      />
      <Text style={styles.header}>
        {categories[activeCategoryId - 1]?.label}
      </Text>
      <ServicesList
        services={selectedCategoryServices || []}
        editable={true}
        categoryId={activeCategoryId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainCont: {
    flex: 1,
    paddingTop: hp(1.7),
    backgroundColor: Colors.background,
    padding: 30,
  },
  titleCont: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
  header: {
    paddingVertical: hp(2),
    fontSize: wp(5.5),
    fontWeight: "bold",
  },
  backendError: {
    color: "red",
    fontSize: wp(4),
    marginVertical: hp(1),
    textAlign: "center",
  },
});
