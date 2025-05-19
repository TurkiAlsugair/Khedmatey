import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Colors } from "../../../constants/styles";

export default function PrivacyAndTermsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Terms and Conditions</Text>
        </View>
        
        <View style={styles.introContainer}>
          <Text style={styles.paragraph}>
            Welcome to Khedmatey. These Terms and Conditions govern your use of the Khedmatey mobile application
            when you request home-service jobs such as cleaning, plumbing, electrical work,
            AC maintenance, or similar (<Text style={styles.boldText}>Services</Text>) from independent third-party providers
            (<Text style={styles.boldText}>Service Providers</Text>).
          </Text>
          
          <Text style={styles.paragraph}>
            Creating an account or using the Platform means you agree to these Terms. Last
            update: <Text style={styles.boldText}>18 May 2025</Text>.
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>1 – About Khedmatey</Text>
          <Text style={styles.paragraph}>
            Khedmatey currently operates only within Saudi Arabia.
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>2 – Purpose of the Platform</Text>
          <Text style={styles.paragraph}>
            Khedmatey is a digital marketplace that connects customers with vetted Service
            Providers. Through the Platform you can:
          </Text>
          
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>1.</Text>
              <Text style={styles.listText}>Browse services and indicative prices.</Text>
            </View>
            
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>2.</Text>
              <Text style={styles.listText}>Book immediate or scheduled appointments.</Text>
            </View>
            
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>3.</Text>
              <Text style={styles.listText}>Track job status in real time.</Text>
            </View>
            
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>4.</Text>
              <Text style={styles.listText}>Pay electronically or (on completion where offered).</Text>
            </View>
            
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>5.</Text>
              <Text style={styles.listText}>Rate the Service Provider after the job.</Text>
            </View>
          </View>
          
          <Text style={styles.paragraph}>
            Khedmatey acts solely as a technical facilitator. The service contract for each job is
            between you and the chosen Service Provider; Khedmatey's responsibilities are
            limited to Section 10.
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>3 – Your Account</Text>
          
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>1.</Text>
              <Text style={styles.listText}>Register with a valid Saudi mobile number.</Text>
            </View>
            
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>2.</Text>
              <Text style={styles.listText}>You are responsible for all activity under your account.</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>4 – Service Availability</Text>
          
          <Text style={styles.paragraph}>
            Coverage and hours may change due to demand, traffic, weather, or operational constraints. 
            We will notify you if a request cannot be fulfilled.
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>5 – Requests & Payment</Text>
          
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>1.</Text>
              <Text style={styles.listText}>You are responsible for the cost of the Service plus any call-out or parts fees the provider lists and you approve in-app.</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>6 – Fulfilment / On-Site Visit</Text>
          
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listText}>You must be present (or grant access) at the chosen address and time.</Text>
            </View>
            
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listText}>If you delay or are absent for more than 20 minutes, the visit may be cancelled and a call-out fee charged.</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>7 – Cancellation</Text>
          
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listText}>You can cancel for free while the request status is "Pending" or "Accepted".</Text>
            </View>
            
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listText}>Khedmatey or the provider may cancel if a job cannot be completed; any prepaid amounts will be refunded via the original payment method.</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>8 – If Something Goes Wrong</Text>
          
          <Text style={styles.paragraph}>
            Report any quality issue within 24 hours of completion, attaching photos or a clear description. 
            After investigation we may offer (a) a redo of the work, or (b) a partial or full refund/credit, depending on circumstances. 
            Khedmatey is not liable for damage arising from misuse of the service or modifications made without the provider's consent.
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>9 – Prices & Promotions</Text>
          
          <Text style={styles.paragraph}>
            Prices in the app are indicative; the final cost can change after on-site inspection and your in-app approval.
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>10 – Limitation of Liability</Text>
          
          <Text style={styles.paragraph}>
            To the fullest extent permitted by law:
          </Text>
          
          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listText}>We are responsible only for losses that are a foreseeable result of our breach of these Terms or our negligence, and our total liability for any request is capped at the amount you paid for that request.</Text>
            </View>
            
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listText}>We are not liable for indirect, incidental, or consequential damages, loss of profit, or issues caused by your own breach of these Terms.</Text>
            </View>
            
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listText}>Nothing excludes liability for death or personal injury caused by our gross negligence or for fraud.</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>11 – Data Protection</Text>
          
          <Text style={styles.paragraph}>
            We process your personal data in line with our privacy policy and applicable regulations.
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>12 – Changes to These Terms</Text>
          
          <Text style={styles.paragraph}>
            We may update these Terms from time to time. Material changes will be announced in-app. 
            Continued use of the Platform after changes take effect constitutes acceptance of the revised Terms.
          </Text>
        </View>
        
        <View style={styles.footnoteContainer}>
          <Text style={styles.footnote}>
            Thank you for choosing Khedmatey. We aim to make reliable home services simple, transparent, and convenient. 
            For support, contact us.
          </Text>
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
  scrollContainer: {
    padding: wp(5),
    paddingBottom: hp(5),
  },
  headerContainer: {
    marginBottom: hp(2),
  },
  headerText: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  introContainer: {
    marginBottom: hp(2),
  },
  sectionContainer: {
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    marginBottom: hp(1),
    color: '#444',
  },
  paragraph: {
    fontSize: wp(4),
    lineHeight: wp(5.5),
    color: '#555',
    marginBottom: hp(1.5),
    textAlign: 'justify',
  },
  boldText: {
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: hp(2),
  },
  listContainer: {
    marginBottom: hp(1.5),
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: hp(1),
    paddingHorizontal: wp(2),
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
    marginTop: hp(2),
    padding: wp(5),
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footnote: {
    fontSize: wp(4),
    color: '#555',
    textAlign: 'center',
  },
}); 