import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  message: string;
  actionLink: string;
}

interface NotificationsState {
  notifications: Notification[];
}

const initialState: NotificationsState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      state.notifications.splice(action.payload, 1); // Removes notification by index
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

// Export actions
export const { setNotifications, addNotification, removeNotification, clearNotifications } = notificationsSlice.actions;

// Export reducer
export default notificationsSlice.reducer;
