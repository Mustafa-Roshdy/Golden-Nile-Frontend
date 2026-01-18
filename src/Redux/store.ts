import { configureStore } from '@reduxjs/toolkit';
import guestHouseSlice from './Slices/guestHouseSlice';
import restaurantSlice from './Slices/restaurantSlice';
import userSlice from './Slices/userSlice';
import chatSlice from './Slices/chatSlice';
import uiSlice from './Slices/uiSlice';

export const store = configureStore({
  reducer: {
    guestHouse: guestHouseSlice,
    restaurant: restaurantSlice,
    user: userSlice,
    chat: chatSlice,
    ui: uiSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
