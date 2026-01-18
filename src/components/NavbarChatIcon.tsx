import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RootState, AppDispatch } from '@/Redux/store';
import { fetchConversations } from '@/Redux/Slices/chatSlice';
import { toggleConversationsList } from '@/Redux/Slices/uiSlice';
import { authHelpers } from '@/services/api';

interface NavbarChatIconProps {
  className?: string;
}


const NavbarChatIcon: React.FC<NavbarChatIconProps> = ({ className }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { unreadCounts } = useSelector((state: RootState) => state.chat);

  const currentUserId = authHelpers.getCurrentUserId();
  const currentUserRole = authHelpers.getCurrentUserRole();

  // Calculate total unread messages
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  const isPriorityUser = currentUserRole === 'admin' || currentUserRole === 'supervisor';

  useEffect(() => {
    if (currentUserId) {
      dispatch(fetchConversations(currentUserId));
    }
  }, [dispatch, currentUserId]);

  const handleChatClick = () => {
    if (!currentUserId) return;
    dispatch(fetchConversations(currentUserId));
    dispatch(toggleConversationsList());
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleChatClick}
        className={`relative p-2 ${isPriorityUser ? 'bg-primary/10 hover:bg-primary/20' : ''}`}
        aria-label={`Chat messages ${totalUnread > 0 ? `(${totalUnread} unread)` : ''}`}
      >
        {isPriorityUser ? (
          <Shield className="w-5 h-5 text-primary" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
        {totalUnread > 0 && (
          <Badge
            variant={isPriorityUser ? "default" : "destructive"}
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {totalUnread > 99 ? '99+' : totalUnread}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default NavbarChatIcon;