import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  cartItems: [],
  cartItemsCount: 0,

  // ✅ Add this function
  setCartItemsCount: (count) => set({ cartItemsCount: count }),

  addToCart: (product) => {
    const existing = get().cartItems.find((item) => item.id === product.id);

    if (existing) {
      const updatedItems = get().cartItems.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      set({ cartItems: updatedItems, cartItemsCount: updatedItems.length });
    } else {
      const newItem = {
        id: product.id,
        itemId: product.itemId,
        itemName: product.itemName,
        retailPrice: product.retailPrice,
        discountAmount: product.discountAmount || 0,
        customerName: product.customerName,
        customerId: product.customerId,
        orderNo: product.orderNo,
        itemCode: product.itemCode,
        date: product.date,
        quantity: 1,
      };

      const updatedItems = [...get().cartItems, newItem];
      set({ cartItems: updatedItems, cartItemsCount: updatedItems.length });
    }
  },

  removeFromCart: (id) => {
    const updatedItems = get().cartItems.filter((item) => item.id !== id);
    set({ cartItems: updatedItems, cartItemsCount: updatedItems.length });
  },

  updateQuantity: (id, qty) => {
    const updatedItems = get().cartItems.map((item) =>
      item.id === id ? { ...item, quantity: qty } : item
    );
    set({ cartItems: updatedItems });
  },

  clearCart: () => set({ cartItems: [], cartItemsCount: 0 }),

  totalPrice: () => {
    return get().cartItems.reduce((sum, item) => {
      const price = parseFloat(item.retailPrice) || 0;
      const discount = parseFloat(item.discountAmount) || 0;
      return sum + (price - discount) * item.quantity;
    }, 0);
  },
}));




// import { create } from "zustand";

// export const useCartStore = create((set, get) => ({
//   cartItems: [],

//   addToCart: (product) => {
//     const existing = get().cartItems.find((item) => item.id === product.id);
//     if (existing) {
//       set({
//         cartItems: get().cartItems.map((item) =>
//           item.id === product.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         ),
//       });
//     } else {
//       // Make sure image is stored correctly
//       set({
//         cartItems: [
//           ...get().cartItems,
//           {
//             id: product.id,
//             title: product.title,
//             image: product.image, // 👈 keep image reference
//             discountPrice: product.discountPrice,
//             quantity: 1,
//           },
//         ],
//       });
//     }
//   },

//   removeFromCart: (id) => {
//     set({
//       cartItems: get().cartItems.filter((item) => item.id !== id),
//     });
//   },

//   updateQuantity: (id, qty) => {
//     set({
//       cartItems: get().cartItems.map((item) =>
//         item.id === id ? { ...item, quantity: qty } : item
//       ),
//     });
//   },

//   clearCart: () => {
//     set({ cartItems: [] });
//   },

//   totalPrice: () => {
//     return get().cartItems.reduce(
//       (sum, item) => sum + item.discountPrice * item.quantity,
//       0
//     );
//   },
// }));




// import { create } from "zustand";

// export const useCartStore = create((set, get) => ({
//   cartItems: [],

//   addToCart: (product) => {
//     const existing = get().cartItems.find((item) => item.id === product.id);
//     if (existing) {
//       // Increase quantity if already in cart
//       set({
//         cartItems: get().cartItems.map((item) =>
//           item.id === product.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         ),
//       });
//     } else {
//       // Add new item
//       set({
//         cartItems: [...get().cartItems, { ...product, quantity: 1 }],
//       });
//     }
//   },

//   removeFromCart: (id) => {
//     set({
//       cartItems: get().cartItems.filter((item) => item.id !== id),
//     });
//   },

//   updateQuantity: (id, qty) => {
//     set({
//       cartItems: get().cartItems.map((item) =>
//         item.id === id ? { ...item, quantity: qty } : item
//       ),
//     });
//   },

//   clearCart: () => {
//     set({ cartItems: [] });
//   },

//   totalPrice: () => {
//     return get().cartItems.reduce(
//       (sum, item) => sum + item.discountPrice * item.quantity,
//       0
//     );
//   },
// }));
