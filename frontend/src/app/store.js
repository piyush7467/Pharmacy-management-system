import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import preferencesReducer from '../features/preferences/preferencesSlice.js';
import authReducer from '../features/auth/authSlice.js';

const rootReducer = combineReducers({
  preferences: preferencesReducer,
  auth: authReducer
});

const persistConfig = {
  key: 'app-preferences',
  storage,
  whitelist: ['preferences'] // Strictly persist only UI preferences. Never persist tokens or auth state.
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});

export const persistor = persistStore(store);
