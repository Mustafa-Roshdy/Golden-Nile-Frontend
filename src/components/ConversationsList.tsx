import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RootState, AppDispatch } from '@/Redux/store';
import { fetchConversations, setCurrentConversation, fetchConversation } from '@/Redux/Slices/chatSlice';
import { setConversationsListOpen, setChatModalOpen } from '@/Redux/Slices/uiSlice';
import { authHelpers } from '@/services/api';
import ConversationItem from './ConversationItem';

const ConversationsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { conversations, loading, currentConversation } = useSelector((state: RootState) => state.chat);
  const { conversationsListOpen } = useSelector((state: RootState) => state.ui);

  const currentUserId = authHelpers.getCurrentUserId();

  useEffect(() => {
    if (currentUserId && conversationsListOpen) {
      dispatch(fetchConversations(currentUserId));
    }
  }, [dispatch, currentUserId, conversationsListOpen]);

  const handleConversationClick = async (conversation: any) => {
    dispatch(setCurrentConversation(conversation));
    try {
      await dispatch(fetchConversation(conversation.contactId));
    } finally {
      dispatch(setChatModalOpen(true));
      dispatch(setConversationsListOpen(false)); // Close list when opening chat
    }
  };

  const handleClose = () => {
    dispatch(setConversationsListOpen(false));
  };

  if (!conversationsListOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:inset-auto md:right-4 md:top-20 md:bottom-4 md:left-auto md:w-96 md:shadow-lg md:border md:rounded-lg">
      <div className="h-full bg-card flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            aria-label="Close conversations list"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-muted-foreground">
                When customers contact you about your properties, conversations will appear here.
              </p>
            </div>
          ) : (
            <div>
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={currentConversation?.id === conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ConversationsList;