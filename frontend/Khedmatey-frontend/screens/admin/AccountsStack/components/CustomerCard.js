import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/styles';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function CustomerCard({ userData }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={Colors.primary} />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.username}>{userData.username}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Customer</Text>
          </View>
          
          <View style={[
            styles.blacklistBadge,
            userData.isBlacklisted ? styles.blacklisted : styles.notBlacklisted
          ]}>
            <Text style={[
              styles.blacklistText,
              userData.isBlacklisted ? styles.blacklistedText : styles.notBlacklistedText
            ]}>
              {userData.isBlacklisted ? "Blacklisted" : "Not Blacklisted"}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Contact Info</Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={20} color={Colors.primary} />
          <Text style={styles.detailText}>{userData.phoneNumber}</Text>
        </View>
        
        {userData.email && (
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.detailText}>{userData.email}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  badge: {
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#3498db',
    fontWeight: 'bold',
    fontSize: wp(3.2),
  },
  blacklistBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  blacklisted: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
  },
  notBlacklisted: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  blacklistText: {
    fontWeight: 'bold',
    fontSize: wp(3.2),
  },
  blacklistedText: {
    color: '#e74c3c',
  },
  notBlacklistedText: {
    color: '#27ae60',
  },
  detailsContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: wp(3.8),
    color: '#555',
  },
}); 