import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ORDER_STATUS_STYLES } from '../../../../constants/styles';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function OrderItem({ order }) {
  const [expanded, setExpanded] = useState(false);
  
  const statusColors = ORDER_STATUS_STYLES[order.status] || {
    text: '#777',
    bg: '#f0f0f0'
  };
  
  const calculateTotal = () => {
    if (!order.invoice?.details?.length) return 0;
    return order.invoice.details.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.orderDate}>{order.date}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {order.status}
            </Text>
          </View>
          
          <Ionicons 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={Colors.primary} 
          />
        </View>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.content}>
          <View style={styles.serviceInfo}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Service:</Text> {order.service?.nameEN}
            </Text>
            {order.followUpService && (
              <View style={styles.followUpContainer}>
                <Text style={styles.followUpLabel}>Follow-up Service:</Text>
                <Text style={styles.detailText}>{order.followUpService.nameEN}</Text>
                <Text style={styles.detailText}>{order.followUpService.descriptionEN}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.locationInfo}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Address:</Text> {order.location?.fullAddress}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>City:</Text> {order.location?.city}
            </Text>
          </View>
          
          {order.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notes}>{order.notes}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: expanded => expanded ? 1 : 0,
    borderBottomColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: wp(3.5),
    color: '#666',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: {
    fontSize: wp(3),
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  serviceInfo: {
    gap: 8,
  },
  locationInfo: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: wp(3.8),
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  detailText: {
    fontSize: wp(3.5),
    color: '#555',
    marginBottom: 2,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#444',
  },
  followUpContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  followUpLabel: {
    fontSize: wp(3.5),
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 4,
  },
  invoiceInfo: {
    gap: 8,
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  invoiceItemName: {
    fontSize: wp(3.5),
    color: '#555',
    flex: 1,
  },
  invoiceItemPrice: {
    fontSize: wp(3.5),
    fontWeight: 'bold',
    color: '#444',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: wp(3.8),
    fontWeight: 'bold',
    color: '#444',
  },
  totalAmount: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  notesContainer: {
    gap: 4,
  },
  notes: {
    fontSize: wp(3.5),
    color: '#555',
    fontStyle: 'italic',
  },
}); 