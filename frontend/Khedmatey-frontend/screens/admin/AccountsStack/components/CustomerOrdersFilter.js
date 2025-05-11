import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView
} from 'react-native';
import { Colors, ORDER_STATUS_STYLES } from '../../../../constants/styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';

const CustomerOrdersFilter = ({ visible, onClose, onApply, initialFilters }) => {
  const [statusFilter, setStatusFilter] = useState(initialFilters?.statusFilter || 'default');

  const handleApply = () => {
    onApply({
      statusFilter
    });
    onClose();
  };

  const handleReset = () => {
    setStatusFilter('default');
  };

  // All possible order statuses
  const statuses = [
    { value: 'PENDING', label: 'PENDING' },
    { value: 'ACCEPTED', label: 'ACCEPTED' },
    { value: 'COMING', label: 'COMING' },
    { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
    { value: 'FINISHED', label: 'FINISHED' },
    { value: 'DECLINED', label: 'DECLINED' },
    { value: 'CANCELLED', label: 'CANCELLED' },
    { value: 'INVOICED', label: 'INVOICED' },
    { value: 'PAID', label: 'PAID' }
  ];

  // Create pairs for grid layout
  const statusPairs = [];
  for (let i = 0; i < statuses.length; i += 2) {
    if (i + 1 < statuses.length) {
      statusPairs.push([statuses[i], statuses[i + 1]]);
    } else {
      statusPairs.push([statuses[i]]);
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <Pressable 
          style={styles.overlay} 
          onPress={onClose}
        />
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter Orders</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          
          {/* Status Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            
            {/* Default option */}
            <TouchableOpacity 
              key="default"
              style={styles.defaultOption}
              onPress={() => setStatusFilter('default')}
            >
              <View style={[
                styles.radioCircle,
                statusFilter === 'default' && styles.radioSelected
              ]}>
                {statusFilter === 'default' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioText}>Default (All)</Text>
            </TouchableOpacity>

            <ScrollView 
              style={styles.statusScrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.gridContainer}>
                {statusPairs.map((pair, index) => (
                  <View key={index} style={styles.gridRow}>
                    {pair.map(status => (
                      <TouchableOpacity 
                        key={status.value}
                        style={styles.gridItem}
                        onPress={() => setStatusFilter(status.value)}
                      >
                        <View style={[
                          styles.radioCircle,
                          statusFilter === status.value && styles.radioSelected
                        ]}>
                          {statusFilter === status.value && <View style={styles.radioInner} />}
                        </View>
                        <View style={[
                          styles.statusChip,
                          { 
                            backgroundColor: ORDER_STATUS_STYLES[status.value]?.bg,
                          }
                        ]}>
                          <Text style={[
                            styles.statusText,
                            { color: ORDER_STATUS_STYLES[status.value]?.text }
                          ]}>
                            {status.label}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                    {pair.length === 1 && <View style={styles.emptyGridItem} />}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: '600',
    marginBottom: 15,
  },
  defaultOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  statusScrollView: {
    maxHeight: hp(40),
  },
  gridContainer: {
    gap: 15,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '48%',
  },
  emptyGridItem: {
    width: '48%',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    opacity: 1,
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioText: {
    fontSize: wp(3.8),
    fontWeight: '500',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
  },
  statusText: {
    fontSize: wp(3.2),
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resetButtonText: {
    fontSize: wp(3.8),
    color: '#555',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '65%',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: wp(3.8),
    color: 'white',
    fontWeight: '600',
  },
});

export default CustomerOrdersFilter; 