"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ChatbotPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Chat state
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  // Protected route check
  useEffect(() => {
    if (!user && !isAuthLoading) router.push('/login');
  }, [user, isAuthLoading]);

  // Handle sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [
      ...prev,
      { user: 'user', text: input }
    ]);

    // Reset input
    setInput('');

    // Simulate bot response (replace with actual API call)
    const botResponse = await new Promise(resolve => 
      setTimeout(() => resolve("I'm a chatbot! How can I assist you today?"), 1000)
    );

    // Add bot message
    setMessages(prev => [
      ...prev,
      { user: 'bot', text: botResponse }
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-dark border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Chatbot Interface
            </h1>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Chat Window */}
          <div className="bg-white dark:bg-neutral-dark rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-4 p-4 h-[60vh] overflow-y-auto">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`mb-4 ${msg.user === 'user' ? 'self-end' : ''}`}
              >
                <div className={`p-2 rounded-lg ${msg.user === 'user' ? 'bg-blue-100 dark:bg-blue-900 self-end' : 'bg-gray-200 dark:bg-slate-800'}`}>
                  <p className="text-sm text-gray-700 dark:text-white">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-2 rounded-l-lg border border-slate-300 dark:border-slate-700 focus:outline-none"
            />
            <button 
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg"
            >
              Send
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
