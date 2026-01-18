import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onEdit: (messageId: string, newMessage: string) => void;
  onDelete: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);

  const handleEdit = () => {
    if (editText.trim() && editText !== message.message) {
      onEdit(message._id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(message.message);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete(message._id);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
          isOwn
            ? 'bg-yellow-500 text-yellow-900 ml-12'
            : 'bg-gray-200 text-gray-900 mr-12'
        }`}
      >
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEdit();
                } else if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit} className="h-6 px-2">
                <Check className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 px-2">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed break-words">{message.message}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs opacity-70">
                {formatTime(message.createdAt)}
                {message.updatedAt && message.updatedAt !== message.createdAt && ' (edited)'}
              </span>
              {isOwn && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="h-6 w-6 p-0 hover:bg-black/10"
                    aria-label="Edit message"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    className="h-6 w-6 p-0 hover:bg-black/10"
                    aria-label="Delete message"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;