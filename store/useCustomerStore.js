import { create } from "zustand";

export const useCustomerStore = create((set) => ({
  customer: null,
  setCustomer: (data) => set({ customer: data }),
  clearCustomer: () => set({ customer: null }),
}));
