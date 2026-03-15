import { apiRequest } from '../api';
import { Listing } from '../listings/listingsService';

export interface Message {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

export interface Chat {
  id: string;
  other_user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  item: {
    id: string;
    name: string;
    photos: string[];
  };
  last_message?: {
    text: string;
    created_at: string;
  };
  unread_count: number;
}

export interface CreateChatInput {
  item_id: string;
  receiver_id: string;
  message: string;
}

export interface SendMessageInput {
  text: string;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
}

export interface ChatsResponse {
  chats: Chat[];
}

export const getChatsService = async (): Promise<Chat[]> => {
  const response = await apiRequest<ChatsResponse>('/chats', {
    method: 'GET',
    requireAuth: true,
  });
  return response.chats || [];
};

export const getChatMessagesService = async (chat_id: string, page: number = 1, limit: number = 50): Promise<MessagesResponse> => {
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  
  return apiRequest<MessagesResponse>(`/chats/${chat_id}/messages?${queryString.toString()}`, {
    method: 'GET',
    requireAuth: true,
  });
};

export const sendMessageService = async (chat_id: string, data: SendMessageInput): Promise<Message> => {
  return apiRequest<Message>(`/chats/${chat_id}/messages`, {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: true,
  });
};

export const createChatService = async (data: CreateChatInput): Promise<Chat> => {
  return apiRequest<Chat>('/chats', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: true,
  });
};

export const markChatAsReadService = async (chat_id: string): Promise<void> => {
  return apiRequest<void>(`/chats/${chat_id}/read`, {
    method: 'PUT',
    body: JSON.stringify({}),
    requireAuth: true,
  });
};

