import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './localStorage';

const initialState = {
  sessionId: null,
  messages: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.unshift(action.payload); // push at top
    },
    resetChat: () => {
      clearState(); // clear localStorage too
      return initialState;
    },
  },
});

export const { setSessionId, addMessage, resetChat } = chatSlice.actions;
export default chatSlice.reducer;