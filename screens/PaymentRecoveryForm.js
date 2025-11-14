import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { addCustomerReceipt } from '../database';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PaymentRecoveryForm({ route, navigation }) {
  const { customerId, customerName } = route.params;

  const [cashBankId, setCashBankId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [attachment, setAttachment] = useState('');

  const pickAttachment = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') setAttachment(result.name);
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

      {/* Customer Name (readonly) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Customer</Text>
        <TextInput
          value={customerName}
          style={[styles.input]}
          editable={false}
        />
      </View>

      {/* Cash/Bank ID */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cash/Bank ID</Text>
        <TextInput
          placeholder="Enter Cash/Bank ID"
          value={cashBankId}
          onChangeText={setCashBankId}
          style={styles.input}
        />
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
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Attachment</Text>
        <TouchableOpacity style={styles.attachmentButton} onPress={pickAttachment}>
          <Feather name="paperclip" size={20} color="#fff" />
          <Text style={styles.attachmentText}>
            {attachment ? attachment : 'Select Attachment'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={savePayment}>
        <Text style={styles.saveButtonText}>Save Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05,
    backgroundColor: '#f4f6f9',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  attachmentText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    flexShrink: 1,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
