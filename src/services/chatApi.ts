import api from '@/interceptor/api';
import { Contact, ApiResponse, CreateContactRequest } from '@/types/chat';

export const chatApi = {
  // Get all contacts for a user
  getContacts: async (userId: string): Promise<{ success: boolean; count: number; data: Contact[] }> => {
    const response = await api.get(`/api/contact/user/${userId}`);
    return response as { success: boolean; count: number; data: Contact[] };
  },

  // Create a new contact/conversation
  createContact: async (data: CreateContactRequest): Promise<{ success: boolean; data: Contact }> => {
    const response = await api.post('/api/contact', data);
    return response as { success: boolean; data: Contact };
  },

  // Get a single contact by ID
  getContact: async (contactId: string): Promise<{ success: boolean; data: Contact }> => {
    const response = await api.get(`/api/contact/${contactId}`);
    return response as { success: boolean; data: Contact };
  },

  // Add a message to a contact
  addMessage: async (contactId: string, message: string): Promise<{ success: boolean; data: Contact }> => {
    const response = await api.post(`/api/contact/${contactId}/message`, { message });
    return response as { success: boolean; data: Contact };
  },

  // Update a message
  updateMessage: async (contactId: string, messageId: string, message: string): Promise<{ success: boolean; data: Contact }> => {
    const response = await api.put(`/api/contact/${contactId}/message/${messageId}`, { message });
    return response as { success: boolean; data: Contact };
  },

  // Delete a message
  deleteMessage: async (contactId: string, messageId: string): Promise<{ success: boolean; data: Contact }> => {
    const response = await api.delete(`/api/contact/${contactId}/message/${messageId}`);
    return response as { success: boolean; data: Contact };
  },

  // Delete a contact
  deleteContact: async (contactId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/contact/${contactId}`);
    return response as { success: boolean; message: string };
  },

  // Mark all messages in a contact as read
  markAsRead: async (contactId: string): Promise<{ success: boolean; data: Contact }> => {
    const response = await api.put(`/api/contact/${contactId}/read`);
    return response as { success: boolean; data: Contact };
  },
};
