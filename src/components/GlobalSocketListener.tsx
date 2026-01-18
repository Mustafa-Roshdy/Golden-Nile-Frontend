import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socketService } from '@/services/socketService';
import { incrementUnreadCount, fetchConversations, addMessageOptimistically } from '@/Redux/Slices/chatSlice';
import { authHelpers } from '@/services/api';
import { RootState, AppDispatch, store } from '@/Redux/store';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const GlobalSocketListener: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { conversations, currentConversation } = useSelector((state: RootState) => state.chat);
    // const currentUserId = authHelpers.getCurrentUserId(); // This will be moved inside useEffect

    const { isAuthenticated } = useAuth();

    useEffect(() => {
        // If not authenticated, disconnect and do nothing
        if (!isAuthenticated) {
            socketService.disconnect();
            return;
        }

        const userId = authHelpers.getCurrentUserId();
        if (!userId) return;

        // Connect (or get existing connection)
        const socket = socketService.connect();

        if (!socket) {
            return;
        }

        const joinRoom = () => {
            socket.emit('join_user_room', userId);
        };

        if (socket.connected) {
            joinRoom();
        }

        const onConnect = () => {
            joinRoom();
        };

        const onReceiveMessage = (data: { conversationId: string; message: string; messageObj: any; senderId: string; receiverId: string }) => {

            if (data.senderId === userId) return;

            // 1. Increment global unread count
            dispatch(incrementUnreadCount(data.conversationId));

            // 2. Handle the message (update messages and conversation preview)
            dispatch(handleSocketMessage({
                conversationId: data.conversationId,
                messageObj: data.messageObj || {
                    _id: `socket-${Date.now()}`,
                    role: 'other',
                    message: data.message,
                    createdAt: new Date().toISOString()
                }
            }));

            // 3. If conversation doesn't exist in list, fetch it
            const state = store.getState();
            const conversationExists = state.chat.conversations.some(c => c.id === data.conversationId);
            if (!conversationExists) {
                dispatch(fetchConversations(userId));
            }
        };

        const onReceiveNotification = (data: { type: string; message: string; bookingId?: string; timestamp: string }) => {

            // Show toast notification
            toast.info(data.message, {
                description: `New ${data.type} notification`,
                duration: 5000,
            });
        };

        socket.on('connect', onConnect);
        socket.on('messageReceived', onReceiveMessage);
        socket.on('notificationReceived', onReceiveNotification);

        return () => {
            socket.off('connect', onConnect);
            socket.off('messageReceived', onReceiveMessage);
            socket.off('notificationReceived', onReceiveNotification);
        };
    }, [dispatch, isAuthenticated]); // Re-run when auth state changes

    return null;
};

export default GlobalSocketListener;
