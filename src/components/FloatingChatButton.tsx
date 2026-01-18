import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { RootState } from '@/Redux/store';
import ChatModal from './ChatModal.tsx';

const FloatingChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  if (!isAuthenticated) return null;
  if (currentUser?.role === 'owner' || currentUser?.role === 'admin') return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
        size="icon"
        aria-label="Open AI Chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default FloatingChatButton;