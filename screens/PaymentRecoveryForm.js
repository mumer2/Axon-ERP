import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { addCustomerReceipt } from '../database';

const { width } = Dimensions.get('window');

export default function PaymentRecoveryForm({ route, navigation }) {
  const { customerId, customerName } = route.params;

  const [cashBankId, setCashBankId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [attachment, setAttachment] = useState('');
  const [attachModalVisible, setAttachModalVisible] = useState(false);
  const [bankDropdownVisible, setBankDropdownVisible] = useState(false);

  const banks = [
    'Habib Bank Limited',
    'MCB Bank Limited',
    'United Bank Limited',
    'National Bank of Pakistan',
    'Bank Alfalah',
    'Standard Chartered',
    'Faysal Bank',
  ];

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!camPerm.granted || !libPerm.granted) {
        Alert.alert('Permissions required', 'Camera and gallery permissions are required!');
      }
    })();
  }, []);

 const pickAttachment = async (fromCamera) => {
  try {
    let result;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // just images
        quality: 0.7,
        allowsEditing: false, // no cropping
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // just images
        quality: 0.7,
        allowsEditing: false, // no cropping
      });
    }

    if (!result.canceled) {
      setAttachment(result.assets[0].uri); // save URI only
      setAttachModalVisible(false); // close modal
    }
  } catch (error) {
    console.log('ImagePicker Error:', error);
    Alert.alert('Error', 'Failed to pick image.');
  }
};


  const savePayment = async () => {
    if (!cashBankId || !amount) {
      Alert.alert('Error', 'Please fill Cash/Bank ID and Amount.');
      return;
    }

    try {
      await addCustomerReceipt({
        customer_id: customerId,
        cash_bank_id: cashBankId,
        amount: parseFloat(amount),
        note,
        attachment,
      });
      Alert.alert('Success', 'Payment recorded successfully!');
      navigation.goBack();
    } catch (error) {
      console.log('DB Insert Error:', error);
      Alert.alert('Error', 'Failed to save payment.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.header}>Payment Recovery</Text>

      {/* Customer */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Customer</Text>
        <TextInput value={customerName} style={styles.input} editable={false} />
      </View>

      {/* Cash/Bank */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cash/Bank Account</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setBankDropdownVisible(true)}>
          <Text>{cashBankId || 'Select Bank Account'}</Text>
          <Feather name="chevron-down" size={20} color="#555" />
        </TouchableOpacity>

        <Modal transparent visible={bankDropdownVisible} animationType="fade">
          <TouchableWithoutFeedback onPress={() => setBankDropdownVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.dropdownModal}>
                  <ScrollView>
                    {banks.map((bank, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setCashBankId(bank);
                          setBankDropdownVisible(false);
                        }}
                      >
                        <Text>{bank}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>

      {/* Amount */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          placeholder="Enter Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      {/* Note */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Note</Text>
        <TextInput
          placeholder="Optional Note"
          value={note}
          onChangeText={setNote}
          style={[styles.input, { height: 80 }]}
          multiline
        />
      </View>

      {/* Attachment */}
     {/* Attachment */}
<View style={styles.inputGroup}>
  <Text style={styles.label}>Attachment</Text>
  <TouchableOpacity style={styles.attachmentButton} onPress={() => setAttachModalVisible(true)}>
    <Feather name="paperclip" size={20} color="#fff" />
    <Text style={styles.attachmentText}>
      {attachment ? 'Attachment Selected' : 'Select Attachment'}
    </Text>
  </TouchableOpacity>

  {/* Removed preview image */}

  <Modal transparent visible={attachModalVisible} animationType="fade">
    <TouchableWithoutFeedback onPress={() => setAttachModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback>
          <View style={styles.attachModal}>
            <View style={styles.attachRow}>
              <TouchableOpacity style={styles.attachOption} onPress={() => pickAttachment(true)}>
                <MaterialIcons name="photo-camera" size={28} color="#333" />
                <Text style={styles.attachOptionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.attachOption} onPress={() => pickAttachment(false)}>
                <MaterialIcons name="photo-library" size={28} color="#333" />
                <Text style={styles.attachOptionText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
</View>


      {/* Save */}
      <TouchableOpacity style={styles.saveButton} onPress={savePayment}>
        <Text style={styles.saveButtonText}>Save Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: width * 0.05, backgroundColor: '#f4f6f9' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: '#555', marginBottom: 5, fontWeight: '700' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  dropdownModal: { width: width * 0.9, backgroundColor: '#fff', borderRadius: 12, maxHeight: 250 },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  attachmentButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#28a745', padding: 12, borderRadius: 12 },
  attachmentText: { color: '#fff', marginLeft: 10, fontSize: 16, flexShrink: 1 },
  attachModal: { width: width * 0.8, backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  attachRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  attachOption: { alignItems: 'center' },
  attachOptionText: { marginTop: 5, fontSize: 16, color: '#333' },
  attachmentPreview: { width: 120, height: 120, marginTop: 10, borderRadius: 12 },
  saveButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});







// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView } from 'react-native';
// import * as DocumentPicker from 'expo-document-picker';
// import { addCustomerReceipt } from '../database';
// import { Feather } from '@expo/vector-icons';

// const { width } = Dimensions.get('window');

// export default function PaymentRecoveryForm({ route, navigation }) {
//   const { customerId, customerName } = route.params;

//   const [cashBankId, setCashBankId] = useState('');
//   const [amount, setAmount] = useState('');
//   const [note, setNote] = useState('');
//   const [attachment, setAttachment] = useState('');

//   const pickAttachment = async () => {
//     let result = await DocumentPicker.getDocumentAsync({});
//     if (result.type === 'success') setAttachment(result.name);
//   };

//   const savePayment = async () => {
//     if (!cashBankId || !amount) {
//       Alert.alert('Error', 'Please fill Cash/Bank ID and Amount.');
//       return;
//     }

//     try {
//       await addCustomerReceipt({
//         customer_id: customerId,
//         cash_bank_id: cashBankId,
//         amount: parseFloat(amount),
//         note,
//         attachment,
//       });
//       Alert.alert('Success', 'Payment recorded successfully!');
//       navigation.goBack();
//     } catch (error) {
//       console.log('DB Insert Error:', error);
//       Alert.alert('Error', 'Failed to save payment.');
//     }
//   };

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
//       <Text style={styles.header}>Payment Recovery</Text>

//       {/* Customer Name (readonly) */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Customer</Text>
//         <TextInput
//           value={customerName}
//           style={[styles.input]}
//           editable={false}
//         />
//       </View>

//       {/* Cash/Bank ID */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Cash/Bank Account</Text>
//         <TextInput
//           placeholder="Enter Cash/Bank ID"
//           value={cashBankId}
//           onChangeText={setCashBankId}
//           style={styles.input}
//         />
//       </View>

//       {/* Amount */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Amount</Text>
//         <TextInput
//           placeholder="Enter Amount"
//           value={amount}
//           onChangeText={setAmount}
//           keyboardType="numeric"
//           style={styles.input}
//         />
//       </View>

//       {/* Note */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Note</Text>
//         <TextInput
//           placeholder="Optional Note"
//           value={note}
//           onChangeText={setNote}
//           style={[styles.input, { height: 80 }]}
//           multiline
//         />
//       </View>

//       {/* Attachment */}
//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Attachment</Text>
//         <TouchableOpacity style={styles.attachmentButton} onPress={pickAttachment}>
//           <Feather name="paperclip" size={20} color="#fff" />
//           <Text style={styles.attachmentText}>
//             {attachment ? attachment : 'Select Attachment'}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Save Button */}
//       <TouchableOpacity style={styles.saveButton} onPress={savePayment}>
//         <Text style={styles.saveButtonText}>Save Payment</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: width * 0.05,
//     backgroundColor: '#f4f6f9',
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 20,
//   },
//   inputGroup: {
//     marginBottom: 15,
//   },
//   label: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 5,
//     fontWeight: '700',
//   },
//   input: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     borderRadius: 12,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   attachmentButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#4CAF50',
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     borderRadius: 12,
//   },
//   attachmentText: {
//     color: '#fff',
//     marginLeft: 10,
//     fontSize: 16,
//     flexShrink: 1,
//   },
//   saveButton: {
//     backgroundColor: '#28a745',
//     paddingVertical: 15,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });
