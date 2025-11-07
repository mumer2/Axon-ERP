import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { initDB } from "./databse/db";
import { CartProvider } from "./context/CartContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
import { getAllOrders } from "./database";
import OrdersScreen from "./screens/OrdersScreen";
import OrderDetailsScreen from "./screens/OrderDetailsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDB();
      setReady(true);
    })();
  }, []);

  if (!ready) {
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
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Onboard1"
            component={OnboardScreen1}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Onboard2"
            component={OnboardScreen2}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Onboard3"
            component={OnboardScreen3}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Onboard4"
            component={OnboardScreen4}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="QRScan"
            component={QRScanScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

           <Stack.Screen
            name="Customer"
            component={CustomerScreen}
            options={{ headerShown: true }}
          />

           <Stack.Screen
            name="AddCustomer"
            component={AddCustomerScreen}
            options={{ headerShown: true }}
          />

             <Stack.Screen
            name="Items"
            component={ItemsScreen}
            options={{ headerShown: true }}
          />

           <Stack.Screen
            name="All Orders"
            component={OrdersScreen}
            options={{ headerShown: true }}
          />

            <Stack.Screen
            name="Order Details"
            component={OrderDetailsScreen}
            options={{ headerShown: true }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
    </GestureHandlerRootView>
  );
}
