import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Button,
} from "react-native";
import { getAllCustomerReceipts } from "../database";
import { Search, ChevronDown } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllPaymentsScreen() {
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  // Filter dropdown state
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [filterType, setFilterType] = useState("all"); // all | today | week | month | year

  // Modal for attachments
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomerReceipts();
      setPayments(data);
      setFiltered(data);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching payments:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ---------- Search ----------
  const handleSearch = (text) => {
    setSearchText(text);
    filterData(text, filterType);
  };

  // ---------- Filter ----------
  const handleFilter = (type) => {
    setFilterType(type);
    setFilterDropdownVisible(false);
    filterData(searchText, type);
  };

  const filterData = (search, filter) => {
    let data = [...payments];

    // Search by customer name
    if (search.trim()) {
      const lower = search.toLowerCase();
      data = data.filter((p) =>
        p.customerName.toLowerCase().includes(lower)
      );
    }

    // Filter by date
    const now = new Date();
    data = data.filter((p) => {
      const date = new Date(p.created_at);
      switch (filter) {
        case "today":
          return (
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        case "week":
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
          startOfWeek.setHours(0, 0, 0, 0);
          return date >= startOfWeek && date <= now;
        case "month":
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        case "year":
          return date.getFullYear() === now.getFullYear();
        case "all":
        default:
          return true;
      }
    });

    setFiltered(data);
  };

  // ---------- Format date ----------
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  // ---------- Handle Attachment Modal ----------
  const handleAttachmentPress = (attachment) => {
    if (attachment) {
      setCurrentAttachment(attachment);
      setModalVisible(true);
    }
  };

  // ---------- Render Payment Card ----------
  const renderPaymentCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.customerName}>{item.customerName}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Cash / Bank</Text>
        <Text style={styles.value}>{item.cash_bank_id}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Amount</Text>
        <Text style={[styles.value, { fontWeight: "700" }]}>
          Rs. {item.amount}
        </Text>
      </View>

      {item.note ? (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Note</Text>
          <Text style={styles.value}>{item.note}</Text>
        </View>
      ) : null}

      <View style={styles.infoRow}>
        <Text style={styles.label}>Attachment</Text>
        <TouchableOpacity onPress={() => handleAttachmentPress(item.attachment)}>
          <Text style={{ color: item.attachment ? "#007bff" : "#555", fontSize: 15 }}>
            {item.attachment ? "View" : "-"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{formatDate(item.created_at)}</Text>
      </View>
    </View>
  );

  if (loading)
    return <ActivityIndicator size="large" style={{ flex: 1, marginTop: 40 }} />;

  const filterOptions = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search customer..."
            placeholderTextColor="#777"
            value={searchText}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
          <Search size={20} color="#777" style={{ marginLeft: 8 }} />
        </View>

        {/* Filter Dropdown */}
        <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setFilterDropdownVisible(!filterDropdownVisible)}
          >
            <Text style={{ color: "#333", fontWeight: "600" }}>
              {filterOptions.find((f) => f.key === filterType)?.label || "Filter"}
            </Text>
            <ChevronDown size={18} color="#333" />
          </TouchableOpacity>

          {filterDropdownVisible && (
            <View style={styles.dropdownList}>
              {filterOptions.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={styles.dropdownItem}
                  onPress={() => handleFilter(f.key)}
                >
                  <Text style={{ color: "#333", fontSize: 15 }}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Payment Cards */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPaymentCard}
          contentContainerStyle={{ padding: 10, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />

       {/* Attachment Modal */}
<Modal visible={modalVisible} transparent={true} animationType="slide">
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {currentAttachment && (
        <Image
          source={{ uri: currentAttachment }}
          style={styles.modalImage}
        />
      )}
      <View style={styles.modalButtonContainer}>
        <TouchableOpacity
          style={styles.modalCloseBtn}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.modalCloseText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    alignItems: "center",
    elevation: 3,
    margin: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: "#333",
  },
  dropdownBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 6,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 2,
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    marginTop: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007bff",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: 120,
    fontWeight: "600",
    color: "#555",
  },
  value: {
    flex: 1,
    color: "#333",
    fontSize: 15,
  },
 modalContainer: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},
modalContent: {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 15,
  alignItems: "center",
  maxWidth: "90%",
},
modalImage: {
  width: 300,
  height: 400,
  resizeMode: "contain",
  marginBottom: 15,
},
modalButtonContainer: {
  width: "100%",
  alignItems: "flex-end",
},
modalCloseBtn: {
  backgroundColor: "#007bff",
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 8,
},
modalCloseText: {
  color: "#fff",
  fontWeight: "600",
  fontSize: 16,
},

});






// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity, Linking, ScrollView } from 'react-native';
// import { getAllCustomerReceipts } from '../database';

// const { width } = Dimensions.get('window');

// export default function AllPaymentsScreen() {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchPayments = async () => {
//     try {
//       setLoading(true);
//       const data = await getAllCustomerReceipts();
//       setPayments(data);
//       setLoading(false);
//     } catch (error) {
//       console.log('Error fetching payments:', error);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPayments();
//   }, []);

//   const columns = [
//     { label: 'Customer', width: 120 },
//     { label: 'Cash/Bank', width: 100 },
//     { label: 'Amount', width: 80 },
//     { label: 'Note', width: 200 },
//     { label: 'Attachment', width: 100 },
//     { label: 'Date', width: 120 },
//   ];

//   const renderPaymentItem = ({ item, index }) => (
//     <View style={[styles.paymentRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
//       <Text style={[styles.cell, { width: columns[0].width }]}>{item.customerName}</Text>
//       <Text style={[styles.cell, { width: columns[1].width }]}>{item.cash_bank_id}</Text>
//       <Text style={[styles.cell, { width: columns[2].width }]}>{item.amount}</Text>
//       <Text style={[styles.cell, { width: columns[3].width }]}>{item.note || '-'}</Text>
//       <TouchableOpacity
//         style={[styles.cell, { width: columns[4].width }]}
//         onPress={() => item.attachment && Linking.openURL(item.attachment)}
//       >
//         <Text style={{ color: item.attachment ? '#007bff' : '#555', textAlign: 'center' }}>
//           {item.attachment ? 'View' : '-'}
//         </Text>
//       </TouchableOpacity>
//       <Text style={[styles.cell, { width: columns[5].width }]}>{item.created_at}</Text>
//     </View>
//   );

//   if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;

//   return (
//     <ScrollView horizontal>
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           {columns.map((col, idx) => (
//             <Text key={idx} style={[styles.headerCell, { width: col.width }]}>{col.label}</Text>
//           ))}
//         </View>

//         {/* Payment List */}
//         <FlatList
//           data={payments}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderPaymentItem}
//           contentContainerStyle={{ paddingBottom: 20 }}
//         />
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 10,
//     backgroundColor: '#f4f6f9',
//     minWidth: width,
//   },
//   header: {
//     flexDirection: 'row',
//     backgroundColor: '#28a745',
//     paddingVertical: 12,
//     borderRadius: 5,
//     marginBottom: 5,
//   },
//   headerCell: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 15,
//     textAlign: 'center',
//     paddingHorizontal: 5,
//   },
//   paymentRow: {
//     flexDirection: 'row',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 5,
//     overflow: 'hidden',
//     alignItems: 'flex-start',
//   },
//   rowEven: {
//     backgroundColor: '#ffffff',
//   },
//   rowOdd: {
//     backgroundColor: '#f0f0f5',
//   },
//   cell: {
//     fontSize: 14,
//     color: '#333',
//     textAlign: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 5,
//     flexWrap: 'wrap',
//   },
// });
