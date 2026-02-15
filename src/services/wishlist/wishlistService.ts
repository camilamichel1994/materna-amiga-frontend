import { apiRequest } from '../api';

export interface WishlistItem {
  id: string;
  type: string;
  size: string;
  brand: string;
  description: string;
  created_at: string;
}

export interface CreateWishlistItemInput {
  type: string;
  size: string;
  brand: string;
  description: string;
}

export interface UpdateWishlistItemInput {
  type?: string;
  size?: string;
  brand?: string;
  description?: string;
}

export interface WishlistResponse {
  wishes: WishlistItem[];
}

export const getWishlistService = async (): Promise<WishlistItem[]> => {
  const response = await apiRequest<WishlistResponse>('/wishlist', {
    method: 'GET',
    requireAuth: true,
  });
  return response.wishes || [];
};

export const addWishlistItemService = async (data: CreateWishlistItemInput): Promise<WishlistItem> => {
  return apiRequest<WishlistItem>('/wishlist', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: true,
  });
};

export const updateWishlistItemService = async (id: string, data: UpdateWishlistItemInput): Promise<WishlistItem> => {
  return apiRequest<WishlistItem>(`/wishlist/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    requireAuth: true,
  });
};

export const removeWishlistItemService = async (id: string): Promise<void> => {
  return apiRequest<void>(`/wishlist/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
};

