import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, Conversation, Message, Contact, SendMessageRequest, UpdateMessageRequest, CreateContactRequest } from '@/types/chat';
import { chatApi } from '@/services/chatApi';
import { authHelpers } from '@/services/api';

export const buildConversationFromContact = (contact: Contact, currentUserId: string, existingUnreadCount: number = 0) => {
  if (!contact) {
    console.error('buildConversationFromContact: contact is undefined');
    throw new Error('Contact data is undefined');
  }

  const user1Id = typeof contact.user === 'string' ? contact.user : contact.user?._id;
  const user2Id = typeof contact.contactUser === 'string' ? contact.contactUser : contact.contactUser?._id;

  // Determine who the other user is
  const isUser1Me = user1Id?.toString() === currentUserId?.toString();
  const otherUser = isUser1Me ? contact.contactUser : contact.user;

  // Backend already handles role adjustment, so messages are ready to use
  const messages = contact.messages || [];
  const lastMessage = messages.length ? messages[messages.length - 1] : undefined;

  return {
    conversation: {
      id: contact._id,
      contactId: contact._id,
      otherUser: otherUser as any,
      lastMessage,
      unreadCount: existingUnreadCount || (contact as any).unreadCount || 0,
      createdAt: contact.createdAt,
    } as Conversation,
    messages,
  };
};

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  unreadCounts: {},
  loading: false,
  error: null,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (userId: string) => {
    const response = await chatApi.getContacts(userId);
    return response.data; // Extract the actual contacts array
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (data: CreateContactRequest) => {
    const response = await chatApi.createContact(data);
    return response.data; // Extract the actual contact data
  }
);

export const fetchConversation = createAsyncThunk(
  'chat/fetchConversation',
  async (contactId: string) => {
    const response = await chatApi.getContact(contactId);
    // Backend already handles role adjustment, so we can use the data directly
    return response.data; // Extract the actual contact data
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ contactId, message }: SendMessageRequest) => {
    const response = await chatApi.addMessage(contactId, message);
    return response.data; // Extract the actual contact data
  }
);

export const editMessage = createAsyncThunk(
  'chat/editMessage',
  async ({ contactId, messageId, message }: UpdateMessageRequest) => {
    const response = await chatApi.updateMessage(contactId, messageId, message);
    return response.data; // Extract the actual contact data
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async ({ contactId, messageId }: { contactId: string; messageId: string }) => {
    const response = await chatApi.deleteMessage(contactId, messageId);
    return response.data; // Extract the actual contact data
  }
);

export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async (contactId: string) => {
    const response = await chatApi.markAsRead(contactId);
    return response.data;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      const nextConversation = action.payload;

      if (nextConversation) {
        // Clear messages if switching conversations
        if (state.currentConversation?.id !== nextConversation.id) {
          state.messages = [];
        }

        // Use a shallow copy to ensure we don't accidentally mutate frozen payload objects
        state.currentConversation = { ...nextConversation, unreadCount: 0 };

        // Reset unread counts in the global collection
        state.unreadCounts[nextConversation.id] = 0;

        // Also find and update the conversation in the main list
        const convIndex = state.conversations.findIndex(c => c.id === nextConversation.id);
        if (convIndex !== -1) {
          state.conversations[convIndex].unreadCount = 0;
        }
      } else {
        state.currentConversation = null;
      }
    },
    resetUnreadCount: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      state.unreadCounts[conversationId] = 0;

      const convIndex = state.conversations.findIndex(c => c.id === conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].unreadCount = 0;
      }

      if (state.currentConversation && state.currentConversation.id === conversationId) {
        state.currentConversation.unreadCount = 0;
      }
    },
    addMessageOptimistically: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    updateMessageOptimistically: (state, action: PayloadAction<{ messageId: string; message: string }>) => {
      const message = state.messages.find(m => m._id === action.payload.messageId);
      if (message) {
        message.message = action.payload.message;
        message.updatedAt = new Date().toISOString();
      }
    },
    removeMessageOptimistically: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(m => m._id !== action.payload);
    },
    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      // ONLY increment if the chat window is NOT currently open for this conversation
      if (state.currentConversation?.id !== conversationId) {
        state.unreadCounts[conversationId] = (state.unreadCounts[conversationId] || 0) + 1;
        const conv = state.conversations.find(c => c.id === conversationId);
        if (conv) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
      }
    },
    handleSocketMessage: (state, action: PayloadAction<{ conversationId: string; messageObj: Message }>) => {
      const { conversationId, messageObj } = action.payload;

      // 1. Update messages list if this chat is open
      if (state.currentConversation?.id === conversationId) {
        // Prevent duplicates
        if (!state.messages.some(m => m._id === messageObj._id)) {
          state.messages.push(messageObj);
        }
      }

      // 2. Update conversation list preview (last message)
      const convIndex = state.conversations.findIndex(c => c.id === conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = messageObj;
        // Move to top of list
        const [conv] = state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<Contact[]>) => {
        state.loading = false;
        const currentUserId = authHelpers.getCurrentUserId();

        // Reset and repopulate unreadCounts to match backend state
        state.conversations = action.payload.map(contact => {
          const backendUnreadCount = (contact as any).unreadCount ?? 0;

          // Ensure the dictionary is updated
          state.unreadCounts[contact._id] = backendUnreadCount;

          return buildConversationFromContact(contact, currentUserId, backendUnreadCount).conversation;
        });
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch conversations';
      })
      // createConversation
      .addCase(createConversation.fulfilled, (state, action: PayloadAction<Contact>) => {
        const currentUserId = authHelpers.getCurrentUserId();
        if (!action.payload) {
          console.error('createConversation: action.payload is undefined', action.payload);
          return;
        }
        const { conversation, messages } = buildConversationFromContact(action.payload, currentUserId);
        state.conversations = [
          conversation,
          ...state.conversations.filter((conv) => conv.id !== conversation.id),
        ];
        state.currentConversation = conversation;
        state.messages = messages;
      })
      // fetchConversation
      .addCase(fetchConversation.fulfilled, (state, action: PayloadAction<Contact>) => {
        const currentUserId = authHelpers.getCurrentUserId();
        const { conversation, messages } = buildConversationFromContact(action.payload, currentUserId);
        state.messages = messages;
        if (state.currentConversation && state.currentConversation.id === conversation.id) {
          state.currentConversation.lastMessage = conversation.lastMessage;
          state.currentConversation.otherUser = conversation.otherUser;
        } else {
          state.currentConversation = conversation;
        }
      })
      // sendMessage
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<Contact>) => {
        const currentUserId = authHelpers.getCurrentUserId();
        const { conversation, messages } = buildConversationFromContact(action.payload, currentUserId);
        state.messages = messages;
        if (state.currentConversation && state.currentConversation.id === conversation.id) {
          state.currentConversation.lastMessage = conversation.lastMessage;
          state.currentConversation.otherUser = conversation.otherUser;
        } else {
          state.currentConversation = conversation;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to send message';
      })
      // editMessage
      .addCase(editMessage.fulfilled, (state, action: PayloadAction<Contact>) => {
        const currentUserId = authHelpers.getCurrentUserId();
        const { conversation, messages } = buildConversationFromContact(action.payload, currentUserId);
        state.messages = messages;
        if (state.currentConversation && state.currentConversation.id === conversation.id) {
          state.currentConversation.lastMessage = conversation.lastMessage;
        }
      })
      .addCase(editMessage.rejected, (state, action) => {
        // Revert optimistic update on error
        state.error = action.error.message || 'Failed to edit message';
      })
      // deleteMessage
      .addCase(deleteMessage.fulfilled, (state, action: PayloadAction<Contact>) => {
        const currentUserId = authHelpers.getCurrentUserId();
        const { conversation, messages } = buildConversationFromContact(action.payload, currentUserId);
        state.messages = messages;
        if (state.currentConversation && state.currentConversation.id === conversation.id) {
          state.currentConversation.lastMessage = conversation.lastMessage;
        }
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        // Revert optimistic update on error
        state.error = action.error.message || 'Failed to delete message';
      });
  },
});

export const {
  setCurrentConversation,
  resetUnreadCount,
  addMessageOptimistically,
  updateMessageOptimistically,
  removeMessageOptimistically,
  incrementUnreadCount,
  handleSocketMessage,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;