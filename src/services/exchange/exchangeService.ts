import { apiRequest } from '../api';
import { Listing } from '../listings/listingsService';

export interface ExchangeItem {
  id: string;
  name: string;
  description: string;
  photos: string[];
  owner: {
    id: string;
    name: string;
    location: string;
  };
}

export interface Exchange {
  id: string;
  offered_item: {
    id: string;
    name: string;
    photos: string[];
  };
  requested_item: {
    id: string;
    name: string;
    photos: string[];
  };
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface CreateExchangeInput {
  offered_item_id: string;
  requested_item_id: string;
  message?: string;
}

export interface UpdateExchangeInput {
  status: 'accepted' | 'rejected';
}

export interface AvailableItemsResponse {
  items: ExchangeItem[];
}

export interface ExchangesResponse {
  exchanges: Exchange[];
}

export const getAvailableItemsService = async (): Promise<ExchangeItem[]> => {
  const response = await apiRequest<AvailableItemsResponse>('/exchanges/available', {
    method: 'GET',
    requireAuth: true,
  });
  return response.items || [];
};

export const createExchangeService = async (data: CreateExchangeInput): Promise<Exchange> => {
  return apiRequest<Exchange>('/exchanges', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: true,
  });
};

export const getExchangesService = async (status?: 'pending' | 'accepted' | 'rejected'): Promise<Exchange[]> => {
  const queryString = status ? `?status=${status}` : '';
  const response = await apiRequest<ExchangesResponse>(`/exchanges${queryString}`, {
    method: 'GET',
    requireAuth: true,
  });
  return response.exchanges || [];
};

export const updateExchangeService = async (id: string, data: UpdateExchangeInput): Promise<Exchange> => {
  return apiRequest<Exchange>(`/exchanges/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    requireAuth: true,
  });
};

