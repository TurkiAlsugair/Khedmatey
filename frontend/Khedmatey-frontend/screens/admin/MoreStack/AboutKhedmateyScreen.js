import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../../constants/styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function AboutKhedmateyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Welcome to Khedmatey</Text>
        </View>
        
        <View style={styles.mainContentContainer}>
          <Text style={styles.paragraph}>
            Khedmatey is an advanced digital platform that connects trusted home-service providers—cleaning crews, plumbers, electricians, AC specialists, and more—with customers through a coordinated dispatch network. Powered by an interactive management engine, Khedmatey lets users:
          </Text>
          
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>1.</Text>
              <Text style={styles.listText}>Browse detailed service menus and transparent prices from vetted providers.</Text>
            </View>
            
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>2.</Text>
              <Text style={styles.listText}>Book immediate or scheduled visits in just a few taps.</Text>
            </View>
            
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>3.</Text>
              <Text style={styles.listText}>Track every job live—from assignment to on-site arrival to completion.</Text>
            </View>
            
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>4.</Text>
              <Text style={styles.listText}>Communicate directly with the assigned technician whenever questions arise.</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.footnoteContainer}>
          <Text style={styles.footnote}>Last updated: 18 May 2025</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButtonContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    marginLeft: wp(1),
    fontSize: wp(4),
    color: Colors.primary,
  },
  scrollContainer: {
    padding: wp(5),
    paddingBottom: hp(5),
  },
  headerContainer: {
    marginBottom: hp(3),
  },
  headerText: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  mainContentContainer: {
    marginBottom: hp(2.5),
  },
  paragraph: {
    fontSize: wp(4),
    lineHeight: wp(5.5),
    color: '#555',
    marginBottom: hp(2),
    textAlign: 'justify',
  },
  listContainer: {
    marginLeft: wp(2),
    marginBottom: hp(1.5),
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: hp(1.5),
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: Colors.primary,
    width: wp(5),
  },
  listText: {
    fontSize: wp(4),
    lineHeight: wp(5.5),
    color: '#555',
    flex: 1,
  },
  footnoteContainer: {
    marginTop: hp(5),
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: hp(2),
  },
  footnote: {
    fontSize: wp(3.5),
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
  },
});
