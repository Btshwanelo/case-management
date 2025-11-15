import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../slices/authSlice';
import forcedActionsReducer from '../slices/forcedActionsSlice';
import notificationReducer from '../slices/notificationSlice';
import detailsReducer from '../slices/detailsSlice';
import checkInReducer from '../slices/checkInSlice';
import residentReducer from '../slices/residentSlice';
import accommodationReducer from '../slices/accommodationSlice';
import announcementsReducer from '../slices/announcementsSlice';
import quickActionReducer from '../slices/quickActionSlice';
import propertyReducer from '../slices/propertySlice';
import navigationReducer from '../slices/navigationSlice';
import applicationReserveReducer from '../slices/reserveApplication';
import { apiSlice } from '../slices/apiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  notifications: notificationReducer,
  forcedActions: forcedActionsReducer,
  quickActions: quickActionReducer,
  announcements: announcementsReducer,
  navigation: navigationReducer,
  details: detailsReducer,
  property: propertyReducer,
  checkIn: checkInReducer,
  resident: residentReducer,
  accommodation: accommodationReducer,
  applicationReserve: applicationReserveReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

// Configuring persistence
const persistConfig = {
  key: 'root',
  storage,
  whitelist: [
    'auth',
    'notifications',
    'details',
    'property',
    'checkIn',
    'accommodation',
    'resident',
    'forcedActions',
    'announcements',
    'quickActions',
    'applicationReserve',
    'navigation',
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(apiSlice.middleware),
});

export const persistor = persistStore(store);

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
