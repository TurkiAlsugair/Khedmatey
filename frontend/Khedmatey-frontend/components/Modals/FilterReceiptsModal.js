import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable
} from 'react-native';
import { Colors } from '../../constants/styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';

const FilterReceiptsModal = ({ visible, onClose, onApply, initialFilters }) => {
  const [priceSort, setPriceSort] = useState(initialFilters?.priceSort || 'default');
  const [statusFilter, setStatusFilter] = useState(initialFilters?.statusFilter || 'default');
  const [dateSort, setDateSort] = useState(initialFilters?.dateSort || 'default');

  const handleApply = () => {
    onApply({
      priceSort,
      statusFilter,
      dateSort
    });
    onClose();
  };

  const handleReset = () => {
    setPriceSort('default');
    setStatusFilter('default');
    setDateSort('default');
  };

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
            <Text style={styles.headerTitle}>Filter Receipts</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          
          {/* Price Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[
                  styles.radioOption, 
                  priceSort === 'default' && styles.radioSelected
                ]}
                onPress={() => setPriceSort('default')}
              >
                <View style={styles.radioCircle}>
                  {priceSort === 'default' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Default</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.radioOption, 
                  priceSort === 'asc' && styles.radioSelected
                ]}
                onPress={() => setPriceSort('asc')}
              >
                <View style={styles.radioCircle}>
                  {priceSort === 'asc' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Low to High</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.radioOption, 
                  priceSort === 'desc' && styles.radioSelected
                ]}
                onPress={() => setPriceSort('desc')}
              >
                <View style={styles.radioCircle}>
                  {priceSort === 'desc' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>High to Low</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Status Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={styles.radioOption}
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
              
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setStatusFilter('PAID')}
              >
                <View style={[
                  styles.radioCircle,
                  statusFilter === 'PAID' && styles.radioSelected
                ]}>
                  {statusFilter === 'PAID' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Paid</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setStatusFilter('INVOICED')}
              >
                <View style={[
                  styles.radioCircle,
                  statusFilter === 'INVOICED' && styles.radioSelected
                ]}>
                  {statusFilter === 'INVOICED' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Invoiced</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Date Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setDateSort('default')}
              >
                <View style={[
                  styles.radioCircle,
                  dateSort === 'default' && styles.radioSelected
                ]}>
                  {dateSort === 'default' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Default</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setDateSort('newest')}
              >
                <View style={[
                  styles.radioCircle,
                  dateSort === 'newest' && styles.radioSelected
                ]}>
                  {dateSort === 'newest' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Newest</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioOption}
                onPress={() => setDateSort('oldest')}
              >
                <View style={[
                  styles.radioCircle,
                  dateSort === 'oldest' && styles.radioSelected
                ]}>
                  {dateSort === 'oldest' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>Oldest</Text>
              </TouchableOpacity>
            </View>
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
              <Text style={styles.applyButtonText}>Apply Filters</Text>
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
  optionsContainer: {
    gap: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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

export default FilterReceiptsModal; 