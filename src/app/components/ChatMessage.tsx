import React from 'react';
import { Message } from '@/app/lib/types';
import PropertyCardComponent from './PropertyCard';

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.sender === 'user';
    const messageClass = isUser ? 'text-right' : 'text-left';
    const bubbleBg = isUser ? 'bg-blue-100' : 'bg-gray-100';
    const textColor = isUser ? 'text-blue-800' : 'text-gray-800';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`p-3 rounded-lg max-w-2xl ${bubbleBg} ${textColor} break-words`}>
                {message.text && <p className="text-sm">{message.text}</p>}
                {message.cards && message.cards.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {message.cards.map((card, index) => (
                            <PropertyCardComponent key={card.ctaUrl || index} {...card} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;