
import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, subscribeToChatMessages } from '../lib/cloudflareApi.js';
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, subscribeToChatMessages } from '../lib/cloudflareApi.js';
import { formatApiError } from '../lib/errorHandling';
import { notifyCustomerServiceOpened, sendUserMessage } from '../services/telegram.service.js';
import Toast from './Toast.jsx';

export default function CustomerService() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{
        id: 1,
        type: 'system',
        text: 'Welcome to Customer Support! How can we help you today?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    const [inputMessage, setInputMessage] = useState('');
    const [toast, setToast] = useState({ message: '', type: '' });

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    useEffect(() => {
        if (isOpen) {
            const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
            const walletAddress = localStorage.getItem('walletAddress') || 'Not connected';
            notifyCustomerServiceOpened({
                // ... data
            }).catch(err => {
                console.log('[Telegram] Background notification sent');
            });
        }
    }, [isOpen]);

    const saveMessageToAdmin = async (message, type, agentName = null) => {
        try {
            // ... message saving logic
            const newMessage = {
                id: Date.now(),
                type,
                text: message,
                agentName,
                time: new Date().toISOString()
            };
            await sendChatMessage(newMessage);
        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        // ... message sending logic

        sendUserMessage(inputMessage, {
            // ... data
        }).catch(err => {
            console.log('[Telegram] Message forwarded');
        });

        // ... agent response simulation
    };

    const connectToLiveAgent = async () => {
        try {
            // ... connecting logic
            await saveMessageToAdmin('Customer requested live agent connection', 'system');
            // ... simulation and agent greeting
        } catch (error) {
            showToast(formatApiError(error), 'error');
        }
    };

    return (
        <>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            {/* ... rest of the component */}
        </>
    );
}
