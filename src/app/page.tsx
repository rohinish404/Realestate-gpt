'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import { Message, ChatResponse } from './lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/app/lib/utils';

export default function HomePage() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 'initial-ai', sender: 'ai', text: "Hello! I'm your property assistant. How can I help you find a home today? Try something like: '3BHK flat in Pune under ₹1.2 Cr'" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() === '') return;

        const newUserMessage: Message = { id: Date.now().toString(), sender: 'user', text: input };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: newUserMessage.text }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ChatResponse = await response.json();

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: data.summary,
                cards: data.properties,
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: "Oops! I encountered an error. Please try again or rephrase your query." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-bg-light text-primary-purple">
            <header className="p-4 shadow-md z-10 bg-primary-pink text-white">
                <h1 className="text-xl font-bold text-center">Property Finder Chatbot</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {loading && (
                    <div className="flex justify-start mb-4">
                        <div className="p-4 rounded-2xl bg-muted text-muted-foreground text-base">
                            Searching...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t-2 border-border-light flex items-center gap-3 shadow-lg bg-white">
                <Input
                    type="text"
                    className="flex-1 h-11 px-4 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 border-2 border-border-light rounded-xl"
                    placeholder="Type your property query here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !loading) {
                            handleSendMessage();
                        }
                    }}
                    disabled={loading}
                />
                <Button
                    onClick={handleSendMessage}
                    disabled={loading || input.trim() === ''}
                    className="h-11 px-5 text-sm font-semibold shrink-0 bg-primary-pink rounded-xl hover:bg-primary-pink-dark"
                >
                    {loading ? 'Sending...' : 'Send'}
                </Button>
            </div>
        </div>
    );
}