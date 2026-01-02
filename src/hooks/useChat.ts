import { useState, useCallback } from 'react';
import chatService from '../services/chat';
import { ChatMessage } from '../types';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      setError(null);

      // Add user message to chat
      const userMessage: ChatMessage = { role: 'user', content: message };
      setMessages(prev => [...prev, userMessage]);

      // Send to API
      const response = await chatService.sendMessage(message, messages);

      // Add assistant response to chat
      const assistantMessage: ChatMessage = { role: 'assistant', content: response.response };
      setMessages(prev => [...prev, assistantMessage]);

      // Update suggestions if provided
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      setLoading(false);

      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [messages]);

  const loadSuggestions = useCallback(async () => {
    try {
      const newSuggestions = await chatService.getSuggestions();
      setSuggestions(newSuggestions);
    } catch (err) {
      console.error('Error loading suggestions:', err);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    suggestions,
    sendMessage,
    loadSuggestions,
    clearMessages
  };
};
