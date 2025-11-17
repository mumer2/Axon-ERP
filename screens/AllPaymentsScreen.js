import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { getAllCustomerReceipts } from '../database';

const { width } = Dimensions.get('window');

export default function AllPaymentsScreen() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomerReceipts();
      setPayments(data);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching payments:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const columns = [
    { label: 'Customer', width: 120 },
    { label: 'Cash/Bank', width: 100 },
    { label: 'Amount', width: 80 },
    { label: 'Note', width: 200 },
    { label: 'Attachment', width: 100 },
    { label: 'Date', width: 120 },
  ];

  const renderPaymentItem = ({ item, index }) => (
    <View style={[styles.paymentRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      <Text style={[styles.cell, { width: columns[0].width }]}>{item.customerName}</Text>
      <Text style={[styles.cell, { width: columns[1].width }]}>{item.cash_bank_id}</Text>
      <Text style={[styles.cell, { width: columns[2].width }]}>{item.amount}</Text>
      <Text style={[styles.cell, { width: columns[3].width }]}>{item.note || '-'}</Text>
      <TouchableOpacity
        style={[styles.cell, { width: columns[4].width }]}
        onPress={() => item.attachment && Linking.openURL(item.attachment)}
      >
        <Text style={{ color: item.attachment ? '#007bff' : '#555', textAlign: 'center' }}>
          {item.attachment ? 'View' : '-'}
        </Text>
      </TouchableOpacity>
      <Text style={[styles.cell, { width: columns[5].width }]}>{item.created_at}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;

  return (
    <ScrollView horizontal>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {columns.map((col, idx) => (
            <Text key={idx} style={[styles.headerCell, { width: col.width }]}>{col.label}</Text>
          ))}
        </View>

        {/* Payment List */}
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPaymentItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f4f6f9',
    minWidth: width,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 5,
  },
  headerCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  paymentRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
  rowEven: {
    backgroundColor: '#ffffff',
  },
  rowOdd: {
    backgroundColor: '#f0f0f5',
  },
  cell: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    flexWrap: 'wrap',
  },
});
