import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Conversation } from '@/types/chat';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  const { otherUser, lastMessage, unreadCount, createdAt } = conversation;

  if (!otherUser) return null;

  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName?.charAt(0) || '?';
    const l = lastName?.charAt(0) || '?';
    return `${f}${l}`.toUpperCase();
  };

  const formatLastMessageTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer border-b border-border hover:bg-muted/50 transition-colors ${isSelected ? 'bg-primary/10 border-primary/20' : ''
        }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Conversation with ${otherUser.firstName} ${otherUser.lastName}${lastMessage ? `. Last message: ${lastMessage.message}` : ''
        }${unreadCount > 0 ? `. ${unreadCount} unread messages` : ''}`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage
            src={otherUser.photo ? (otherUser.photo.startsWith('http') ? otherUser.photo : `${api.defaults.baseURL}${otherUser.photo}`) : undefined}
            alt={`${otherUser.firstName} ${otherUser.lastName}`}
          />
          <AvatarFallback>
            {getInitials(otherUser.firstName, otherUser.lastName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground truncate">
              {otherUser.firstName} {otherUser.lastName}
            </h3>
            <div className="flex items-center gap-2">
              {lastMessage && (
                <span className="text-xs text-muted-foreground">
                  {formatLastMessageTime(lastMessage.createdAt)}
                </span>
              )}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </div>
          </div>

          {lastMessage ? (
            <p className={`text-sm truncate mt-1 ${unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
              }`}>
              {lastMessage.role === 'me' && 'You: '}{truncateMessage(lastMessage.message)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">No messages yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;