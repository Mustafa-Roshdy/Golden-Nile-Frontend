export interface Message {
  _id: string;
  role: 'me' | 'other';
  message: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Contact {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  contactUser: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  messages: Message[];
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  contactId: string;
  otherUser: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
  };
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  unreadCounts: { [conversationId: string]: number };
  loading: boolean;
  error: string | null;
}

export interface UIState {
  selectedConversationId: string | null;
  chatModalOpen: boolean;
  conversationsListOpen: boolean;
}

export interface SendMessageRequest {
  contactId: string;
  message: string;
}

export interface UpdateMessageRequest {
  contactId: string;
  messageId: string;
  message: string;
}

export interface CreateContactRequest {
  contactUserId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}