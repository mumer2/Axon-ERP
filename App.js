
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initDB, initRecentActivityTable,autoResetDailyVisitStatus } from "./database";
import { CartProvider } from "./context/CartContext";

// Screens
import WelcomeScreen from "./screens/WelcomeScreen";
import OnboardScreen1 from "./screens/OnboardScreen1";
import OnboardScreen2 from "./screens/OnboardScreen2";
import OnboardScreen3 from "./screens/OnboardScreen3";
import OnboardScreen4 from "./screens/OnboardScreen4";
import QRScanScreen from "./screens/QRScanScreen";
import HomeScreen from "./screens/HomeScreen";
import CustomerScreen from "./screens/CustomerScreen";
import AddCustomerScreen from "./screens/AddCustomerScreen";
import ItemsScreen from "./screens/ItemsScreen";
import OrdersScreen from "./screens/OrdersScreen";
import OrderDetailsScreen from "./screens/OrderDetailsScreen";
import OrderListScreen from "./screens/OrderListScreen";
import LiveTrackingScreen from "./screens/LiveTrackingScreen";
import UpdateLocationScreen from "./screens/UpdateLocationScreen";
import UpdateLocationMapScreen from "./screens/UpdateLocationMapScreen";
import CustomerPaymentRecovery from "./screens/CustomerPaymentRecovery";
import PaymentRecoveryForm from "./screens/PaymentRecoveryForm";
import AllPaymentsScreen from "./screens/AllPaymentsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);


  useEffect(() => {
  autoResetDailyVisitStatus();
}, []);

  useEffect(() => {
    // Initialize databases
    initDB();
    initRecentActivityTable();

    // Check AsyncStorage for first launch
    const checkFirstLaunch = async () => {
      try {
        const alreadyLaunched = await AsyncStorage.getItem("alreadyLaunched");
        if (alreadyLaunched === null) {
          // First launch
          await AsyncStorage.setItem("alreadyLaunched", "true");
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (err) {
        console.error("Error checking first launch", err);
        setIsFirstLaunch(false);
      }
    };

    checkFirstLaunch();
  }, []);

  // Show loading indicator while checking
  if (isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator   screenOptions={{
          headerStyle: {
            backgroundColor: '#1E90FF', // header background color
          },
          headerTintColor: '#fff', // header text color
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
            {isFirstLaunch && (
              <>
                <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Onboard1" component={OnboardScreen1} options={{ headerShown: false }} />
                <Stack.Screen name="Onboard2" component={OnboardScreen2} options={{ headerShown: false }} />
                <Stack.Screen name="Onboard3" component={OnboardScreen3} options={{ headerShown: false }} />
                <Stack.Screen name="Onboard4" component={OnboardScreen4} options={{ headerShown: false }} />
              </>
            )}

            {/* Main App Screens */}
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Customer" component={CustomerScreen} options={{ headerShown: true }} />
            <Stack.Screen name="AddCustomer" component={AddCustomerScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Items" component={ItemsScreen} options={{ headerShown: true }} />
            <Stack.Screen name="All Orders" component={OrdersScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Order Details" component={OrderDetailsScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Order List" component={OrderListScreen} options={{ headerShown: true }} />
            <Stack.Screen name="QRScan" component={QRScanScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Live Tracking" component={LiveTrackingScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Update Location" component={UpdateLocationScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Update Location Map" component={UpdateLocationMapScreen} options={{ headerShown: true }} />
            <Stack.Screen name="Customers List" component={CustomerPaymentRecovery} options={{ headerShown: true }} />
            <Stack.Screen name="Payment Recovery Form" component={PaymentRecoveryForm} options={{ headerShown: true }} />
            <Stack.Screen name="All Payments" component={AllPaymentsScreen} options={{ headerShown: true }} />

          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </GestureHandlerRootView>
  );
}









// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   View,
//   Platform,
//   KeyboardAvoidingView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { initDB, initRecentActivityTable ,resetDailyCustomerStatus} from "./database";
// import { CartProvider } from "./context/CartContext";

// // Screens
// import WelcomeScreen from "./screens/WelcomeScreen";
// import OnboardScreen1 from "./screens/OnboardScreen1";
// import OnboardScreen2 from "./screens/OnboardScreen2";
// import OnboardScreen3 from "./screens/OnboardScreen3";
// import OnboardScreen4 from "./screens/OnboardScreen4";
// import QRScanScreen from "./screens/QRScanScreen";
// import HomeScreen from "./screens/HomeScreen";
// import CustomerScreen from "./screens/CustomerScreen";
// import AddCustomerScreen from "./screens/AddCustomerScreen";
// import ItemsScreen from "./screens/ItemsScreen";
// import OrdersScreen from "./screens/OrdersScreen";
// import OrderDetailsScreen from "./screens/OrderDetailsScreen";
// import OrderListScreen from "./screens/OrderListScreen";
// import LiveTrackingScreen from "./screens/LiveTrackingScreen";
// import UpdateLocationScreen from "./screens/UpdateLocationScreen";
// import UpdateLocationMapScreen from "./screens/UpdateLocationMapScreen";
// import CustomerPaymentRecovery from "./screens/CustomerPaymentRecovery";
// import PaymentRecoveryForm from "./screens/PaymentRecoveryForm";

// // Icons
// import { Home, ShoppingCart } from "lucide-react-native";

// const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

// // ------------------- Bottom Tabs -------------------
// function MainTabs() {
//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <Tab.Navigator
//         screenOptions={{
//           headerShown: false,
//            headerStyle: { backgroundColor: "#1E90FF" },
//               headerTintColor: "#fff",
//               headerTitleStyle: { fontWeight: "bold" },
//           tabBarActiveTintColor: "#1E90FF",
//           tabBarInactiveTintColor: "#888",
//           tabBarStyle: {
//             height: 100, // slightly taller to accommodate margin
//             backgroundColor: "#fff",
//             paddingBottom: 30, // added bottom margin
//           },
//           tabBarLabelStyle: {
//             fontSize: 12,
//             fontWeight: "600",
//             marginBottom: 10,
//           },
//           tabBarIconStyle: { marginTop: 5 },
//           tabBarHideOnKeyboard: true,
//         }}
//       >
//         <Tab.Screen
//           name="HomeTab"
//           component={HomeScreen}
//           options={{
//             tabBarLabel: "Home",
//             tabBarIcon: ({ color, size }) => <Home color={color} size={24} />,
//           }}
//         />
//         {/* <Tab.Screen
//           name="All Orders"
//           component={OrdersScreen}
//           options={{
//             tabBarLabel: "Orders",
//             headerShown: true ,
//             tabBarIcon: ({ color, size }) => (
//               <ShoppingCart color={color} size={24} />
//             ),
//           }}
          
//         /> */}
//       </Tab.Navigator>
//     </KeyboardAvoidingView>
//   );
// }


// // ------------------- Main App -------------------
// export default function App() {
//   const [isFirstLaunch, setIsFirstLaunch] = useState(null);

//   useEffect(() => {
//   resetDailyCustomerStatus();
// }, []);

//   useEffect(() => {
//     // Initialize databases
//     initDB();
//     initRecentActivityTable();

//     // Check AsyncStorage for first launch
//     const checkFirstLaunch = async () => {
//       try {
//         const alreadyLaunched = await AsyncStorage.getItem("alreadyLaunched");
//         if (alreadyLaunched === null) {
//           await AsyncStorage.setItem("alreadyLaunched", "true");
//           setIsFirstLaunch(true);
//         } else {
//           setIsFirstLaunch(false);
//         }
//       } catch (err) {
//         console.error("Error checking first launch", err);
//         setIsFirstLaunch(false);
//       }
//     };

//     checkFirstLaunch();
//   }, []);

//   if (isFirstLaunch === null) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <CartProvider>
//         <NavigationContainer>
//           <Stack.Navigator
//             screenOptions={{
//               headerStyle: { backgroundColor: "#1E90FF" },
//               headerTintColor: "#fff",
//               headerTitleStyle: { fontWeight: "bold" },
//             }}
//           >
//             {isFirstLaunch && (
//               <>
//                 <Stack.Screen
//                   name="Welcome"
//                   component={WelcomeScreen}
//                   options={{ headerShown: false }}
//                 />
//                 <Stack.Screen
//                   name="Onboard1"
//                   component={OnboardScreen1}
//                   options={{ headerShown: false }}
//                 />
//                 <Stack.Screen
//                   name="Onboard2"
//                   component={OnboardScreen2}
//                   options={{ headerShown: false }}
//                 />
//                 <Stack.Screen
//                   name="Onboard3"
//                   component={OnboardScreen3}
//                   options={{ headerShown: false }}
//                 />
//                 <Stack.Screen
//                   name="Onboard4"
//                   component={OnboardScreen4}
//                   options={{ headerShown: false }}
//                 />
//               </>
//             )}

//             {/* Main App Screens */}
//             <Stack.Screen
//               name="MainTabs"
//               component={MainTabs}
//               options={{ headerShown: false }}
//             />
//             <Stack.Screen
//               name="Customer"
//               component={CustomerScreen}
//               options={{ headerShown: true }}
//             />
//             <Stack.Screen
//               name="AddCustomer"
//               component={AddCustomerScreen}
//               options={{ headerShown: true }}
//             />
//             <Stack.Screen
//               name="Items"
//               component={ItemsScreen}
//               options={{ headerShown: true }}
//             />
//             <Stack.Screen
//               name="All Orders"
//               component={OrdersScreen}
//               options={{ headerShown: true }}
//             />
//             <Stack.Screen
//               name="Order Details"
//               component={OrderDetailsScreen}
//               options={{ headerShown: true }}
//             />
//             <Stack.Screen
//               name="Order List"
//               component={OrderListScreen}
//               options={{ headerShown: true }}
//             />
//             <Stack.Screen
//               name="QRScan"
//               component={QRScanScreen}
//               options={{ headerShown: false }}
//             />
//             <Stack.Screen
//               name="Live Tracking"
//               component={LiveTrackingScreen}
//               options={{ headerShown: true }}
//             />
//             <Stack.Screen
//               name="Update Location"
//               component={UpdateLocationScreen}
//               options={{ headerShown: true }}
//             />
//             <Stack.Screen
//               name="Update Location Map"
//               component={UpdateLocationMapScreen}
//               options={{ headerShown: true }}
//             />
//             <Stack.Screen
//               name="Customers List"
//               component={CustomerPaymentRecovery}
//               options={{ headerShown: true }}
//             />
//             <Stack.Screen
//               name="Payment Recovery Form"
//               component={PaymentRecoveryForm}
//               options={{ headerShown: true }}
//             />
//           </Stack.Navigator>
//         </NavigationContainer>
//       </CartProvider>
//     </GestureHandlerRootView>
//   );
// }























// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { useEffect, useState } from "react";
// import { ActivityIndicator, View } from "react-native";
// import { initDB } from "./database";
// import { CartProvider } from "./context/CartContext";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { initRecentActivityTable } from './database';

// // Screens
// import WelcomeScreen from "./screens/WelcomeScreen";
// import OnboardScreen1 from "./screens/OnboardScreen1";
// import OnboardScreen2 from "./screens/OnboardScreen2";
// import OnboardScreen3 from "./screens/OnboardScreen3";
// import OnboardScreen4 from "./screens/OnboardScreen4";
// import QRScanScreen from "./screens/QRScanScreen";
// import HomeScreen from "./screens/HomeScreen";
// import CustomerScreen from "./screens/CustomerScreen";
// import AddCustomerScreen from "./screens/AddCustomerScreen";
// import ItemsScreen from "./screens/ItemsScreen";
// import OrdersScreen from "./screens/OrdersScreen";
// import OrderDetailsScreen from "./screens/OrderDetailsScreen";
// import OrderListScreen from "./screens/OrderListScreen";
// import AllRecentActivities from "./screens/AllRecentActivities";

// const Stack = createNativeStackNavigator();

// export default function App() {
//   useEffect(() => {
//     initDB(); // ✅ Initialize database once
//   }, []);

//   // const [ready, setReady] = useState(false);

//   // useEffect(() => {
//   //   (async () => {
//   //     await initDB();
//   //     setReady(true);
//   //   })();
//   // }, []);

//   // if (!ready) {
//   //   return (
//   //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//   //       <ActivityIndicator size="large" />
//   //     </View>
//   //   );
//   // }

//   useEffect(() => {
//   initRecentActivityTable();
// }, []);
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//     <CartProvider>
//       <NavigationContainer>
//         <Stack.Navigator>
//           <Stack.Screen
//             name="Welcome"
//             component={WelcomeScreen}
//             options={{ headerShown: false }}
//           />
//           <Stack.Screen
//             name="Onboard1"
//             component={OnboardScreen1}
//             options={{ headerShown: false }}
//           />
//           <Stack.Screen
//             name="Onboard2"
//             component={OnboardScreen2}
//             options={{ headerShown: false }}
//           />
//           <Stack.Screen
//             name="Onboard3"
//             component={OnboardScreen3}
//             options={{ headerShown: false }}
//           />
//           <Stack.Screen
//             name="Onboard4"
//             component={OnboardScreen4}
//             options={{ headerShown: false }}
//           />

//           <Stack.Screen
//             name="QRScan"
//             component={QRScanScreen}
//             options={{ headerShown: false }}
//           />
//           <Stack.Screen
//             name="Home"
//             component={HomeScreen}
//             options={{ headerShown: false }}
//           />

//            <Stack.Screen
//             name="Customer"
//             component={CustomerScreen}
//             options={{ headerShown: true }}
//           />

//            <Stack.Screen
//             name="AddCustomer"
//             component={AddCustomerScreen}
//             options={{ headerShown: true }}
//           />

//              <Stack.Screen
//             name="Items"
//             component={ItemsScreen}
//             options={{ headerShown: true }}
//           />

//            <Stack.Screen
//             name="All Orders"
//             component={OrdersScreen}
//             options={{ headerShown: true }}
//           />

//             <Stack.Screen
//             name="Order Details"
//             component={OrderDetailsScreen}
//             options={{ headerShown: true }}
//           />

//             <Stack.Screen
//             name="Order List"
//             component={OrderListScreen}
//             options={{ headerShown: true }}
//           />

//           <Stack.Screen
//   name="AllRecentActivities"
//   component={AllRecentActivities}
//   options={{ headerShown: true }}
// />


//         </Stack.Navigator>
//       </NavigationContainer>
//     </CartProvider>
//     </GestureHandlerRootView>
//   );
// }
