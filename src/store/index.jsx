import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';
import { loadState, saveState } from './localStorage';

const preloadedState = {
  chat: loadState() || undefined
};

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
  preloadedState,
});

// Persist on any store change
store.subscribe(() => {
  saveState(store.getState().chat);
});