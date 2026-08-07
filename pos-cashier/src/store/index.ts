import { configureStore } from '@reduxjs/toolkit';
import { authReducer, posReducer } from './slices';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pos: posReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
