import { apiRequest } from '../api';
import { Listing } from '../listings/listingsService';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  location?: string;
  baby_age_range?: string;
  rating?: number;
  total_sales?: number;
  created_at: string;
}

export interface Review {
  id: string;
  user: {
    name: string;
    avatar_url?: string;
  };
  rating: number;
  comment?: string;
  created_at: string;
}

export interface ProfileResponse extends User {
  reviews?: Review[];
}

export interface UpdateProfileInput {
  name?: string;
  location?: string;
  baby_age_range?: string;
  avatar_url?: string;
}

export interface CreateRatingInput {
  rating: number;
  comment?: string;
}

export interface UserItemsResponse {
  items: Listing[];
}

export const getProfileService = async (id: string, reviewsPage: number = 1, reviewsLimit: number = 5): Promise<ProfileResponse> => {
  const queryString = new URLSearchParams({
    reviewsPage: String(reviewsPage),
    reviewsLimit: String(reviewsLimit),
  });
  
  return apiRequest<ProfileResponse>(`/profile/${id}?${queryString.toString()}`, {
    method: 'GET',
  });
};

export const updateProfileService = async (id: string, data: UpdateProfileInput): Promise<User> => {
  return apiRequest<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    requireAuth: true,
  });
};

export const getUserItemsService = async (id: string): Promise<Listing[]> => {
  const response = await apiRequest<UserItemsResponse>(`/users/${id}/items`, {
    method: 'GET',
  });
  return response.items || [];
};

export const createRatingService = async (id: string, data: CreateRatingInput): Promise<Review> => {
  return apiRequest<Review>(`/users/${id}/ratings`, {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: true,
  });
};

