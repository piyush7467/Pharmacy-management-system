import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'system', // 'light' | 'dark' | 'system'
  sidebarCollapsed: false,
  receiptFormat: '80mm', // '80mm' | '58mm' | 'A4'
  shopProfile: {
    pharmacyName: 'PharmaFlow Central Pharmacy',
    tagline: 'Licensed Retail Dispensary & Clinical Supplies',
    licenseNumber: 'DL-2026-98442',
    taxNumber: 'GSTIN-29AABCP1234D1ZK',
    phone: '+91 80 4123 4567',
    email: 'dispensary@pharmaflow.demo',
    address: '42 Brigade Road, Commercial District, Bengaluru, Karnataka 560001',
    receiptFooter: 'Thank you for choosing PharmaFlow! Wishing you good health.',
    returnPolicy: 'Medicines once sold cannot be returned without original receipt within 7 days.'
  }
};

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    setReceiptFormat: (state, action) => {
      state.receiptFormat = action.payload;
    },
    setShopProfile: (state, action) => {
      state.shopProfile = { ...state.shopProfile, ...action.payload };
    }
  }
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  setReceiptFormat,
  setShopProfile
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
