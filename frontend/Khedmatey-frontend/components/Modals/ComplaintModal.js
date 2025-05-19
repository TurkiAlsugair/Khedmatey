import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Pressable,
  ActivityIndicator
} from 'react-native';
import { Colors } from '../../constants/styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const ComplaintModal = ({ visible, onClose, orderId, onSuccess }) => {
  const { token } = useContext(AuthContext);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (description.trim() === '') {
      setError('Please describe your complaint');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await axios.post(`${API_BASE_URL}/request/${orderId}/complaint`, {
        description
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // If successful - pass the complete response data
      onSuccess({
        id: response.data.data?.id || '0',
        createdAt: response.data.data?.createdAt,
        description
      });
      
      // Don't reset the form here - we'll do it when the modal closes
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    // Reset all form state
    setDescription('');
    setError('');
    setSubmitting(false);
    // Close the modal
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={resetAndClose}
    >
      <View style={styles.centeredView}>
        <Pressable 
          style={styles.overlay} 
          onPress={resetAndClose}
        />
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Submit Complaint</Text>
            <TouchableOpacity onPress={resetAndClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionTitle}>What went wrong?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Please describe the issue in detail..."
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
          />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={resetAndClose}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
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
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: '600',
    marginBottom: 12,
    color: '#444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
    minHeight: hp(20),
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: wp(3.8),
    color: '#555',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '65%',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: wp(3.8),
    color: 'white',
    fontWeight: '600',
  },
});

export default ComplaintModal; 