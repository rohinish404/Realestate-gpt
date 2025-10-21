import React from 'react';
import { Message } from '@/app/lib/types';
import PropertyCardComponent from './PropertyCard';
import { cn } from '@/app/lib/utils';

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.sender === 'user';

    return (
        <div className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
            <div className={cn(
                "p-4 max-w-2xl break-words rounded-2xl",
                isUser
                    ? "bg-primary-pink text-white"
                    : "bg-bg-lighter text-secondary-purple"
            )}>
                {message.text && <p className="text-base leading-relaxed">{message.text}</p>}
                {message.cards && message.cards.length > 0 && (
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
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