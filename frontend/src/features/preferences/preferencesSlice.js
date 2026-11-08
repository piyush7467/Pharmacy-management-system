import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'system', // 'light' | 'dark' | 'system'
  sidebarCollapsed: false
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
    }
  }
});

export const { setTheme, toggleSidebar, setSidebarCollapsed } = preferencesSlice.actions;
export default preferencesSlice.reducer;
