import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light', // 'light' | 'dark' | 'system'
  sidebarCollapsed: false,
  receiptFormat: '80mm', // '80mm' | '58mm' | 'A4'
  alertSettings: {
    nearExpiryDays: 60, // days threshold for near expiry (default: 60)
    defaultLowStock: 10, // default minimum units threshold (default: 10)
    enableLowStockAlert: true,
    enableNearExpiryAlert: true
  },
  shopProfile: {
    pharmacyName: '',
    legalName: '',
    tagline: '',
    category: 'Retail Community Pharmacy',
    licenseNumber: '',
    pharmacistInCharge: '',
    pharmacistCouncilNo: '',
    licenseExpiry: '',
    taxNumber: '',
    phone: '',
    emergencyHelpline: '',
    email: '',
    address: '',
    operatingHours: 'Mon - Sat: 9:00 AM - 9:00 PM',
    is24Hours: false,
    upiId: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    receiptFooter: 'Thank you for your visit. Wishing you good health!',
    returnPolicy: 'Medicines once sold can only be returned with original invoice within 7 days.'
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
    },
    setAlertSettings: (state, action) => {
      state.alertSettings = { ...state.alertSettings, ...action.payload };
    }
  }
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  setReceiptFormat,
  setShopProfile,
  setAlertSettings
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
