import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { initDB, getAllCustomers, searchCustomers, updateVisited } from "../database";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const getAvatarColor = (name) => {
  const colors = ["#FFB6C1", "#87CEFA", "#90EE90", "#FFA07A", "#DDA0DD"];
  const charCode = name.charCodeAt(0) || 65;
  return colors[charCode % colors.length];
};

export default function CustomerScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadDB = async () => {
      await initDB();
      fetchCustomers();
    };
    loadDB();
  }, []);

  const fetchCustomers = async () => {
    const data = await getAllCustomers();
    setCustomers(data);
  };

  const handleSearch = async (text) => {
    setSearch(text);
    if (text.trim() === "") {
      fetchCustomers();
    } else {
      const data = await searchCustomers(text);
      setCustomers(data);
    }
  };

  const toggleVisited = async (id, visited) => {
    await updateVisited(id, visited ? 0 : 1);
    fetchCustomers();
  };

  const handleCustomerPress = (customer) => {
    // Navigate to ItemsScreen and pass the selected customer's ID
    navigation.navigate("Items", { customerId: customer.entity_id, customerName: customer.name });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleCustomerPress(item)}
    >
      {/* Letter Avatar */}
      <View
        style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}
      >
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.infoContainer}>
        
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>
         <TouchableOpacity onPress={() => toggleVisited(item.entity_id, item.visited)}>
  <View
    style={[
      styles.visitedBox,
      {
        backgroundColor: item.visited ? "green" : "transparent",
        borderWidth: 1,
        borderColor: item.visited ? "green" : "#555",
      },
    ]}
  >
    <Text style={[styles.tick, { color: item.visited ? "#fff" : "#555" }]}>
      ✓
    </Text>
  </View>
</TouchableOpacity>

        </View>

        {/* Phone and Last Seen */}
        <Text style={styles.phone}>📞 {item.phone}</Text>
        <Text style={styles.lastSeen}>Last seen: {item.last_seen}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
    <View style={styles.container}>
      {/* Search Bar with Add Button */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search Customer..."
            value={search}
            onChangeText={handleSearch}
          />
          <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
        </View>

        {/* <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddCustomer")}
        >
          <Feather name="plus" size={28} color="blue" />
        </TouchableOpacity> */}
      </View>

      {/* Customer List */}
      <FlatList
        data={customers}
        keyExtractor={(item) => item.entity_id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  searchBar: {
    flex: 1,
    height: 40,
  },
  searchIcon: {
    marginLeft: 10,
  },
  addButton: {
    marginLeft: 10,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f1f9",
    borderRadius: 10,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#fff",
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  phone: {
    color: "#555",
    marginTop: 2,
  },
  lastSeen: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
  visited: {
     width: 24,
    height: 24,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  visitedBox: {
  width: 24,
  height: 24,
  borderRadius: 4,
  justifyContent: "center",
  alignItems: "center",
},
tick: {
  fontWeight: "bold",
  fontSize: 16,
  textAlign: "center",
},

});




// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
// } from "react-native";
// import { initDB, getAllCustomers, searchCustomers, updateVisited } from "../database";
// import { Feather,plus } from "@expo/vector-icons"; // expo vector icons

// const getAvatarColor = (name) => {
//   const colors = ["#FFB6C1", "#87CEFA", "#90EE90", "#FFA07A", "#DDA0DD"];
//   const charCode = name.charCodeAt(0) || 65;
//   return colors[charCode % colors.length];
// };

// export default function CustomerScreen({navigation}) {
//   const [customers, setCustomers] = useState([]);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     const loadDB = async () => {
//       await initDB();
//       fetchCustomers();
//     };
//     loadDB();
//   }, []);

//   const fetchCustomers = async () => {
//     const data = await getAllCustomers();
//     setCustomers(data);
//   };

//   const handleSearch = async (text) => {
//     setSearch(text);
//     if (text.trim() === "") {
//       fetchCustomers();
//     } else {
//       const data = await searchCustomers(text);
//       setCustomers(data);
//     }
//   };

//   const toggleVisited = async (id, visited) => {
//     await updateVisited(id, visited ? 0 : 1);
//     fetchCustomers();
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.itemContainer}>
//       {/* Letter Avatar */}
//       <View
//         style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}
//       >
//         <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
//       </View>

//       <View style={styles.infoContainer}>
//         {/* Name and Visited Status */}
//         <View style={styles.nameRow}>
//           <Text style={styles.name}>{item.name}</Text>
//           <TouchableOpacity onPress={() => toggleVisited(item.entity_id, item.visited)}>
//             <Text style={[styles.visited, { color: item.visited ? "green" : "red" }]}>
//               {item.visited ? "✅ Visited" : "❌ Not Visited"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Phone and Last Seen */}
//         <Text style={styles.phone}>📞 {item.phone}</Text>
//         <Text style={styles.lastSeen}>Last seen: {item.last_seen}</Text>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       {/* Search Bar with Icon */}
//      <View style={styles.searchRow}>
//   <View style={styles.searchContainer}>
//     <TextInput
//       style={styles.searchBar}
//       placeholder="Search Customer..."
//       value={search}
//       onChangeText={handleSearch}
//     />
//     <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
//   </View>

//   <TouchableOpacity
//     style={styles.addButton}
//     onPress={() => navigation.navigate("AddCustomer")}
//   >
//     <Feather name="plus" size={28} color="blue" />
//   </TouchableOpacity>
// </View>


//       <FlatList
//         data={customers}
//         keyExtractor={(item) => item.entity_id.toString()}
//         renderItem={renderItem}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: "#fff",
//   },
//   searchRow: {
//   flexDirection: "row",
//   alignItems: "center",
//   marginBottom: 10,
// },
// searchContainer: {
//   flex: 1,
//   flexDirection: "row",
//   alignItems: "center",
//   borderWidth: 1,
//   borderColor: "#ccc",
//   borderRadius: 8,
//   paddingHorizontal: 10,
//   backgroundColor: "#f9f9f9",
// },
// searchBar: {
//   flex: 1,
//   height: 40,
// },
// searchIcon: {
//   marginLeft: 10,
// },
// addButton: {
//   marginLeft: 10,
//   padding: 4,
//   justifyContent: "center",
//   alignItems: "center",
//   backgroundColor: "#f1f1f9",
//   borderRadius:10,
// },

//   itemContainer: {
//     flexDirection: "row",
//     padding: 10,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//     alignItems: "center",
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarText: {
//     fontSize: 20,
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   infoContainer: {
//     flex: 1,
//   },
//   nameRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   name: {
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   phone: {
//     color: "#555",
//     marginTop: 2,
//   },
//   lastSeen: {
//     color: "#888",
//     fontSize: 12,
//     marginTop: 2,
//   },
//   visited: {
//     fontWeight: "bold",
//   },
// });
