import { apiRequest } from '../api';
import { Listing } from '../listings/listingsService';

export interface Favorite {
  id: string;
  item: Listing;
  created_at: string;
}

export interface FavoritesResponse {
  items: Favorite[];
}

export const getFavoritesService = async (): Promise<Favorite[]> => {
  const response = await apiRequest<FavoritesResponse>('/favorites', {
    method: 'GET',
    requireAuth: true,
  });
  return response.items || [];
};

export const addFavoriteService = async (item_id: string): Promise<Favorite> => {
  return apiRequest<Favorite>('/favorites', {
    method: 'POST',
    body: JSON.stringify({ item_id }),
    requireAuth: true,
  });
};

export const removeFavoriteService = async (item_id: string): Promise<void> => {
  return apiRequest<void>(`/favorites/${item_id}`, {
    method: 'DELETE',
    body: JSON.stringify({}),
    requireAuth: true,
  });
};

