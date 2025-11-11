import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { initDB, initRecentActivityTable } from "./database";
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
import AllRecentActivities from "./screens/AllRecentActivities";
import LiveTrackingScreen from "./screens/LiveTrackingScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

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
          <Stack.Navigator>
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
            <Stack.Screen name="Recent Activities" component={AllRecentActivities} options={{ headerShown: true }} />
            <Stack.Screen name="Live Tracking" component={LiveTrackingScreen} options={{ headerShown: true }} />

          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </GestureHandlerRootView>
  );
}





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
