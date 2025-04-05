import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Colors } from "../../constants/styles";

export default function Categories({
  categories,
  activeCategoryId,
  setActiveCategoryId,
}) {
  return (
    <View style={styles.scrollCont}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => {
          const isActive = category.categoryId === activeCategoryId;
          return (
            <TouchableOpacity
              key={category.categoryId}
              style={
                isActive ? styles.activeScrollTextCont : styles.scrollTextCont
              }
              onPress={() => setActiveCategoryId(category.categoryId)}
            >
              <Text
                style={isActive ? styles.activeScrollText : styles.scrollText}
              >
                {category.categoryName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollCont: {
    height: 45,
  },
  scrollTextCont: {
    backgroundColor: "white",
    paddingHorizontal: 10,
    justifyContent: "center",
    marginRight: wp(5),
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.primary,
  },
  activeScrollTextCont: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    justifyContent: "center",
    marginRight: wp(5),
    borderBottomWidth: 5,
    borderRadius: 10,
    borderColor: Colors.secondary,
  },
  scrollText: {
    color: "black",
  },
  activeScrollText: {
    color: "white",
    fontWeight: "bold",
  },
});
