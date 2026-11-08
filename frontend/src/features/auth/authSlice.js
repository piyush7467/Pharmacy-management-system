import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // { id, email, fullName, role }
  accessToken: null, // strictly in-memory
  isAuthenticated: false,
  isInitialized: false
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    }
  }
});

export const { setCredentials, updateUser, clearCredentials, setInitialized } = authSlice.actions;
export default authSlice.reducer;
