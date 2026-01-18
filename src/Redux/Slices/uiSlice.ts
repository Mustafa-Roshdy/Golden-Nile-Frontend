import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState } from '@/types/chat';

const initialState: UIState = {
  selectedConversationId: null,
  chatModalOpen: false,
  conversationsListOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedConversationId: (state, action: PayloadAction<string | null>) => {
      state.selectedConversationId = action.payload;
    },
    setChatModalOpen: (state, action: PayloadAction<boolean>) => {
      state.chatModalOpen = action.payload;
    },
    setConversationsListOpen: (state, action: PayloadAction<boolean>) => {
      state.conversationsListOpen = action.payload;
    },
    toggleChatModal: (state) => {
      state.chatModalOpen = !state.chatModalOpen;
    },
    toggleConversationsList: (state) => {
      state.conversationsListOpen = !state.conversationsListOpen;
    },
  },
});

export const {
  setSelectedConversationId,
  setChatModalOpen,
  setConversationsListOpen,
  toggleChatModal,
  toggleConversationsList,
} = uiSlice.actions;

export default uiSlice.reducer;