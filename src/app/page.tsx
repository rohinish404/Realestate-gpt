'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import { Message, ChatResponse } from './lib/types';

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
        <div className="flex flex-col h-screen bg-gray-50 font-sans">
            <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-md z-10">
                <h1 className="text-xl font-bold text-center">Property Finder Chatbot</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {loading && (
                    <div className="flex justify-start mb-4">
                        <div className="p-3 rounded-lg bg-gray-100 text-gray-700 text-sm">
                            Typing...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200 flex items-center shadow-lg">
                <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-full py-2 px-4 mr-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-full shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || input.trim() === ''}
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
}