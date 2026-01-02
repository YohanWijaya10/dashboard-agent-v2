import axios, { AxiosInstance } from 'axios';
import { ChatMessage, ChatResponse } from '../types';

class ChatService {
  private client: AxiosInstance;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.client = axios.create({
      baseURL,
      timeout: 60000, // Longer timeout for AI responses
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    const response = await this.client.post<ChatResponse>('/api/chat', {
      message,
      conversationHistory
    });
    return response.data;
  }

  async getSuggestions(): Promise<string[]> {
    const response = await this.client.get<{ suggestions: string[] }>('/api/chat/suggestions');
    return response.data.suggestions;
  }
}

export default new ChatService();
