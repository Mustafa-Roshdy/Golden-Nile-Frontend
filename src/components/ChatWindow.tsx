import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RootState, AppDispatch } from '@/Redux/store';
import {
  sendMessage,
  editMessage,
  deleteMessage,
  fetchConversation,
  resetUnreadCount,
  markAsRead,
  addMessageOptimistically,
  updateMessageOptimistically,
  removeMessageOptimistically
} from '@/Redux/Slices/chatSlice';
import { setChatModalOpen } from '@/Redux/Slices/uiSlice';
import { authHelpers } from '@/services/api';
import MessageBubble from './MessageBubble';
import { socketService } from '@/services/socketService'; // Import the shared socket service
import ErrorBoundary from './ErrorBoundary'; // Import error boundary

/**
 * ChatWindow Component: Manages real-time messaging between Guest and Owner.
 */
const ChatWindowContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentConversation, messages, loading } = useSelector((state: RootState) => state.chat);
  const { chatModalOpen } = useSelector((state: RootState) => state.ui);

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUserId = authHelpers.getCurrentUserId();

  // Scroll to bottom whenever messages update or modal opens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatModalOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, chatModalOpen]);

  // Handle socket room joining and unread count reset
  useEffect(() => {
    const socket = socketService.getSocket();

    if (chatModalOpen && currentConversation) {
      // Mark as read in backend and locally
      dispatch(resetUnreadCount(currentConversation.id));
      dispatch(markAsRead(currentConversation.id));

      // Join the conversation room for real-time updates
      if (socket) {
        socket.emit('join_conversation', currentConversation.id);
      }
    }
  }, [chatModalOpen, currentConversation, dispatch]);

  // Focus input on modal open
  useEffect(() => {
    if (chatModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatModalOpen]);

  // Polling for new messages when chat is open
  useEffect(() => {
    if (!chatModalOpen || !currentConversation) return;

    const interval = setInterval(() => {
      dispatch(fetchConversation(currentConversation.contactId));
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [chatModalOpen, currentConversation, dispatch]);

  /**
   * Sends a message to the backend and handles optimistic updates.
   */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Add message locally before server response
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      role: 'me' as const,
      message: messageText,
      createdAt: new Date().toISOString(),
    };

    dispatch(addMessageOptimistically(optimisticMessage));

    try {
      await dispatch(sendMessage({
        contactId: currentConversation.contactId,
        message: messageText,
      })).unwrap();
    } catch (error) {
      console.error('Failed to send message:', error);
      // Rollback on failure
      dispatch(removeMessageOptimistically(optimisticMessage._id));
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (messageId: string, newMessage: string) => {
    if (!currentConversation) return;
    try {
      dispatch(updateMessageOptimistically({ messageId, message: newMessage }));
      await dispatch(editMessage({
        contactId: currentConversation.contactId,
        messageId,
        message: newMessage,
      })).unwrap();
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentConversation) return;
    try {
      dispatch(removeMessageOptimistically(messageId));
      await dispatch(deleteMessage({
        contactId: currentConversation.contactId,
        messageId,
      })).unwrap();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    dispatch(setChatModalOpen(false));
  };

  // Guard clause for early return
  if (!chatModalOpen || !currentConversation || !currentConversation.otherUser) return null;

  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName?.charAt(0) || '?';
    const l = lastName?.charAt(0) || '?';
    return `${f}${l}`.toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:inset-auto md:right-4 md:top-20 md:bottom-4 md:left-auto md:w-96 md:shadow-lg md:border md:rounded-lg">
      <div className="h-full bg-card flex flex-col">
        {/* Header Section */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={handleClose} className="md:hidden" aria-label="Back">
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <Avatar className="w-10 h-10">
            <AvatarImage
              src={currentConversation.otherUser.photo ? (currentConversation.otherUser.photo.startsWith('http') ? currentConversation.otherUser.photo : `${api.defaults.baseURL}${currentConversation.otherUser.photo}`) : undefined}
              alt="Avatar"
            />
            <AvatarFallback>
              {getInitials(currentConversation.otherUser.firstName, currentConversation.otherUser.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {currentConversation.otherUser.firstName} {currentConversation.otherUser.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">Active now</p>
          </div>

          <Button variant="ghost" size="sm" onClick={handleClose} aria-label="Close">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages List Section */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={message.role === 'me'}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Section */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending}
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sending} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap the main content in the ErrorBoundary
const ChatWindow: React.FC = () => (
  <ErrorBoundary>
    <ChatWindowContent />
  </ErrorBoundary>
);

export default ChatWindow;
