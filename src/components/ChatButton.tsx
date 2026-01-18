import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RootState, AppDispatch, store } from '@/Redux/store';
import { createConversation, fetchConversation, fetchConversations, setCurrentConversation } from '@/Redux/Slices/chatSlice';
import { setChatModalOpen } from '@/Redux/Slices/uiSlice';
import { authHelpers } from '@/services/api';

interface ChatButtonProps {
  ownerId: string;
  propertyTitle: string;
  placeType?: "guest_house" | "restaurant";
  className?: string;
  iconOnly?: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ ownerId, propertyTitle, placeType, className, iconOnly }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { conversations } = useSelector((state: RootState) => state.chat);

  const currentUserId = authHelpers.getCurrentUserId();
  const currentUserRole = authHelpers.getCurrentUserRole();
  const isLoggedIn = !!currentUserId;

  const getButtonText = () => {
    const isPriorityUser = currentUserRole === 'admin' || currentUserRole === 'supervisor';

    if (placeType === "restaurant") {
      return isPriorityUser ? "Priority Contact - Restaurant" : "Contact with The Owner";
    }
    return isPriorityUser ? "Priority Contact - Guest House" : "Contact with The Owner";
  };

  const handleChatClick = async () => {
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }

    if (!ownerId || ownerId === currentUserId) return;

    try {
      // Ensure conversations are loaded and use fresh state after await
      let currentConversations = conversations;
      if (conversations.length === 0) {
        await dispatch(fetchConversations(currentUserId)).unwrap();
        currentConversations = store.getState().chat.conversations;
      }

      // Check if conversation already exists
      const existingConversation = currentConversations.find(
        conv => conv.otherUser?._id === ownerId || (conv.otherUser as any)?.id === ownerId
      );

      if (existingConversation) {
        dispatch(setCurrentConversation(existingConversation));
        await dispatch(fetchConversation(existingConversation.contactId));
        dispatch(setChatModalOpen(true));
      } else {
        const resultAction = await dispatch(createConversation({ contactUserId: ownerId }));
        if (createConversation.fulfilled.match(resultAction)) {
          const contact = resultAction.payload;
          if (contact?._id) {
            await dispatch(fetchConversation(contact._id));
            dispatch(setChatModalOpen(true));
          }
        }
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const isPriorityUser = currentUserRole === 'admin' || currentUserRole === 'supervisor';

  return (
    <Button
      onClick={handleChatClick}
      className={`gap-2 ${className} ${isPriorityUser ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
      variant={isPriorityUser ? "default" : "outline"}
      aria-label={`Contact owner about ${propertyTitle}`}
    >
      <MessageCircle className={iconOnly ? "w-5 h-5" : "w-4 h-4"} />
      {!iconOnly && getButtonText()}
    </Button>
  );
};

export default ChatButton;
