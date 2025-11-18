import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { getAllCustomers, searchCustomers } from "../database";
import { MapPin, Search } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UpdateLocationScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | selected | not_selected

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchCustomers);
    return unsubscribe;
  }, [navigation]);

  const fetchCustomers = async () => {
    const data = await getAllCustomers();
    setCustomers(data);
    filterAndSet(data, searchQuery, statusFilter);
  };

  const filterAndSet = (data, search, status) => {
    let filtered = data;

    if (search.trim()) {
      const lower = search.toLowerCase();
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(lower));
    }

    // ---------- Correct Location Based Filter ----------
    if (status === "selected") {
      filtered = filtered.filter(
        (c) => c.latitude != null && c.longitude != null
      );
    } else if (status === "not_selected") {
      filtered = filtered.filter(
        (c) => c.latitude == null || c.longitude == null
      );
    }
    // ---------------------------------------------------

    setFilteredCustomers(filtered);
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    const data = await searchCustomers(text);
    setCustomers(data);
    filterAndSet(data, text, statusFilter);
  };

  const handleFilter = (filter) => {
    setStatusFilter(filter);
    filterAndSet(customers, searchQuery, filter);
  };

  const handleSelectCustomer = (customer) => {
    navigation.navigate("Update Location Map", { customer });
    Keyboard.dismiss();
  };

  const profileColors = [
    "#FF6B6B",
    "#6BCB77",
    "#4D96FF",
    "#FFD93D",
    "#FF6EC7",
    "#9B5DE5",
    "#00F5D4",
    "#F9C74F",
  ];
  const getProfileColor = (id) => profileColors[id % profileColors.length];

  const renderCustomerItem = ({ item }) => {
    const hasLocation = item.latitude != null && item.longitude != null;

    return (
      <TouchableOpacity
        style={styles.customerItem}
        onPress={() => handleSelectCustomer(item)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.profileCircle,
            { backgroundColor: getProfileColor(item.entity_id) },
          ]}
        >
          <Text style={styles.profileText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.name}</Text>
          <Text style={styles.customerPhone}>{item.phone || "No Phone"}</Text>
        </View>

        {/* RIGHT SIDE PIN ICON */}
        <View
          style={[
            styles.updateIcon,
            {
              backgroundColor: hasLocation ? "#007bff" : "#ddd",
            },
          ]}
        >
          <MapPin size={24} color={hasLocation ? "#fff" : "#888"} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f9f9f9" }}
      edges={["bottom", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search customer..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <View style={styles.iconWrapper}>
              <Search size={20} color="#999" />
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filterContainer}>
           <TouchableOpacity
  style={[styles.filterBtn, statusFilter === "all" && styles.filterActive]}
  onPress={() => handleFilter("all")}
>
  <Text
    style={[
      styles.filterText,
      statusFilter === "all" && styles.filterTextActive,
    ]}
  >
    All
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={[
    styles.filterBtn,
    statusFilter === "selected" && styles.filterActive,
  ]}
  onPress={() => handleFilter("selected")}
>
  <Text
    style={[
      styles.filterText,
      statusFilter === "selected" && styles.filterTextActive,
    ]}
  >
    Selected
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={[
    styles.filterBtn,
    statusFilter === "not_selected" && styles.filterActive,
  ]}
  onPress={() => handleFilter("not_selected")}
>
  <Text
    style={[
      styles.filterText,
      statusFilter === "not_selected" && styles.filterTextActive,
    ]}
  >
    Not Selected
  </Text>
</TouchableOpacity>
          </View>

          {/* Customer List */}
          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.entity_id.toString()}
            renderItem={renderCustomerItem}
            contentContainerStyle={{ paddingTop: 6 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, paddingTop: 12 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 3,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 16 },
  iconWrapper: { marginLeft: 8 },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 2,
    overflow: "hidden",
  },
  filterBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  filterActive: { backgroundColor: "#007bff" },
  filterText: { fontWeight: "600", color: "#333" },
  filterTextActive: { color: "#fff" },

  customerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  customerInfo: { flex: 1, marginLeft: 12 },
  customerName: { fontSize: 16, fontWeight: "600", color: "#333" },
  customerPhone: { fontSize: 14, color: "#666", marginTop: 2 },
  updateIcon: {
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});




// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Keyboard,
//   Platform,
//   KeyboardAvoidingView,
// } from "react-native";
// import { getAllCustomers, searchCustomers } from "../database";
// import { MapPin, Search } from "lucide-react-native"; 
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function UpdateLocationScreen({ navigation }) {
//   const [customers, setCustomers] = useState([]);
//   const [filteredCustomers, setFilteredCustomers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all"); // "all", "updated", "not_updated"

//  useEffect(() => {
//   const unsubscribe = navigation.addListener("focus", () => {
//     // If coming back from map screen
//     fetchCustomers();
//   });

//   return unsubscribe;
// }, [navigation]);


//   const fetchCustomers = async () => {
//     const data = await getAllCustomers();
//     setCustomers(data);
//     filterAndSet(data, searchQuery, statusFilter);
//   };

//   // Filter by search text + status
//   const filterAndSet = (data, search, status) => {
//     let filtered = data;

//     if (search.trim()) {
//       const lower = search.toLowerCase();
//       filtered = filtered.filter((c) => c.name.toLowerCase().includes(lower));
//     }

//     if (status === "updated") {
//       filtered = filtered.filter((c) => c.location_status === "Updated");
//     } else if (status === "not_updated") {
//       filtered = filtered.filter((c) => c.location_status !== "Updated");
//     }

//     setFilteredCustomers(filtered);
//   };

//   const handleSearch = async (text) => {
//     setSearchQuery(text);
//     const data = await searchCustomers(text);
//     setCustomers(data); // Update main list
//     filterAndSet(data, text, statusFilter);
//   };

//   const handleFilter = (filter) => {
//     setStatusFilter(filter);
//     filterAndSet(customers, searchQuery, filter);
//   };

//   const handleSelectCustomer = (customer) => {
//     navigation.navigate("Update Location Map", { customer });
//     Keyboard.dismiss();
//   };

//   // Colors for profile circles
//   const profileColors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#FF6EC7", "#9B5DE5", "#00F5D4", "#F9C74F"];
//   const getProfileColor = (id) => profileColors[id % profileColors.length];

//   // const renderCustomerItem = ({ item }) => (
//   //   <TouchableOpacity style={styles.customerItem} onPress={() => handleSelectCustomer(item)}>
//   //     <View style={[styles.profileCircle, { backgroundColor: getProfileColor(item.entity_id) }]}>
//   //       <Text style={styles.profileText}>{item.name.charAt(0).toUpperCase()}</Text>
//   //     </View>

//   //     <View style={styles.customerInfo}>
//   //       <Text style={styles.customerName}>{item.name}</Text>
//   //       <Text style={styles.customerPhone}>{item.phone || "No Phone"}</Text>
//   //     </View>

//   //     <TouchableOpacity onPress={() => handleSelectCustomer(item)} style={[
//   //       styles.updateIcon,
//   //       { backgroundColor: item.location_status === "Updated" ? "#007bff" : "#cce5ff" }
//   //     ]}>
//   //       <MapPin size={24} color={item.location_status === "Updated" ? "#fff" : "#007bff"} />
//   //     </TouchableOpacity>
//   //   </TouchableOpacity>
//   // );
//   const renderCustomerItem = ({ item }) => {
//   const hasLocation = item.latitude != null && item.longitude != null;

//   return (
//     <TouchableOpacity
//       style={styles.customerItem}
//       onPress={() => handleSelectCustomer(item)} // always clickable
//       activeOpacity={0.7}
//     >
//       <View
//         style={[
//           styles.profileCircle,
//           { backgroundColor: getProfileColor(item.entity_id) },
//         ]}
//       >
//         <Text style={styles.profileText}>{item.name.charAt(0).toUpperCase()}</Text>
//       </View>

//       <View style={styles.customerInfo}>
//         <Text style={styles.customerName}>{item.name}</Text>
//         <Text style={styles.customerPhone}>{item.phone || "No Phone"}</Text>
//       </View>

//       <View
//         style={[
//           styles.updateIcon,
//           {
//             backgroundColor: hasLocation
//               ? item.location_status === "Updated"
//                 ? "#007bff"
//                 : "#007bff" // dark for customers with location
//               : "#ddd", // dull gray for no location
//           },
//         ]}
//       >
//         <MapPin
//           size={24}
//           color={hasLocation
//             ? "#fff" // colored icon for existing location
//             : "#888"} // gray for no location
//         />
//       </View>
//     </TouchableOpacity>
//   );
// };


//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#f9f9f9" }} edges={["bottom","left","right"]}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
//       >
//         <View style={styles.container}>
//           {/* Search Bar */}
//           <View style={styles.searchContainer}>
//             <TextInput
//               style={styles.searchInput}
//               placeholder="Search customer..."
//               placeholderTextColor="#999"
//               value={searchQuery}
//               onChangeText={handleSearch}
//             />
//             <View style={styles.iconWrapper}>
//               <Search size={20} color="#999" />
//             </View>
//           </View>

//           {/* Filters */}
//           <View style={styles.filterContainer}>
//             <TouchableOpacity
//               style={[styles.filterBtn, statusFilter === "all" && styles.filterActive]}
//               onPress={() => handleFilter("all")}
//             >
//               <Text style={styles.filterText}>All</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.filterBtn, statusFilter === "updated" && styles.filterActive]}
//               onPress={() => handleFilter("updated")}
//             >
//               <Text style={styles.filterText}>Updated</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.filterBtn, statusFilter === "not_updated" && styles.filterActive]}
//               onPress={() => handleFilter("not_updated")}
//             >
//               <Text style={styles.filterText}>Not Updated</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Customer List */}
//           <FlatList
//             data={filteredCustomers}
//             keyExtractor={(item) => item.entity_id.toString()}
//             renderItem={renderCustomerItem}
//             contentContainerStyle={{ paddingTop: 6 }}
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, paddingHorizontal: 15, paddingTop:12 },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 10,
//     fontSize: 16,
//   },
//   iconWrapper: {
//     marginLeft: 8,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   filterContainer: {
//     flexDirection: "row",
//     marginBottom: 6,
//     borderRightWidth: 0,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 2,
//     overflow: "hidden",
//   },
//   filterBtn: {
//    flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 10,
//     backgroundColor: "#f8f9fa",
//     borderRightWidth: 1,
//     borderColor: "#ccc",
//     borderRadius:2,
//   },
//   filterActive: {
//     backgroundColor: "#007bff",
//   },
//   filterText: { color: "#333", fontWeight: "600" },
//   customerItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   profileCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
//   profileText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
//   customerInfo: { flex: 1, marginLeft: 12 },
//   customerName: { fontSize: 16, fontWeight: "600", color: "#333" },
//   customerPhone: { fontSize: 14, color: "#666", marginTop: 2 },
//   updateIcon: { padding: 8, borderRadius: 8, justifyContent: "center", alignItems: "center" },
// });