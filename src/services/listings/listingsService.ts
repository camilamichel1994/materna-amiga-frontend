import { apiRequest } from '../api';

export type ListingTypeApi = 'venda' | 'doacao' | 'troca';

export interface Listing {
  id: string;
  name: string;
  description: string;
  price: number | null;
  ownerId: string;
  listingType?: ListingTypeApi;
  condition?: string;
  photos?: string[];
  images?: string[];
  city?: string | null;
  location?: string | null;
  message?: string;
  seller?: {
    id: string;
    name: string;
    avatar_url?: string | null;
    location?: string | null;
    rating?: number;
    state?: string;
  };
  rating?: number;
  sold?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateListingInput {
  name: string;
  description: string;
  condition: 'Novo' | 'Usado - Excelente' | 'Usado - Bom' | 'Usado - Regular';
  listingType: ListingTypeApi;
  price?: number;
  city?: string;
  message?: string;
  photos: string[];
}

export interface UpdateListingInput {
  name?: string;
  description?: string;
  condition?: 'Novo' | 'Usado - Excelente' | 'Usado - Bom' | 'Usado - Regular';
  price?: number;
  city?: string;
  message?: string;
  photos?: string[];
}

export interface ListingsQueryParams {
  q?: string;
  ownerId?: string;
  condition?: string;
  listingType?: string;
  priceMin?: number;
  priceMax?: number;
  city?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  includeSold?: boolean;
}

export interface ListingsResponse {
  data: Listing[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const getListingsService = async (params?: ListingsQueryParams): Promise<ListingsResponse> => {
  const queryString = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, String(value));
      }
    });
  }
  
  const endpoint = `/listings${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  const response = await apiRequest<ListingsResponse>(endpoint, {
    method: 'GET',
  });
  
  return response;
};

export const getListingByIdService = async (id: string): Promise<Listing> => {
  return apiRequest<Listing>(`/listings/${id}`, {
    method: 'GET',
  });
};

export const createListingService = async (data: CreateListingInput): Promise<Listing> => {
  return apiRequest<Listing>('/listings', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: true,
  });
};

export const updateListingService = async (id: string, data: UpdateListingInput): Promise<Listing> => {
  return apiRequest<Listing>(`/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    requireAuth: true,
  });
};

export const deleteListingService = async (id: string): Promise<void> => {
  return apiRequest<void>(`/listings/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
};

export const getSimilarListingsService = async (id: string): Promise<Listing[]> => {
  const response = await apiRequest<Listing[]>(`/listings/${id}/similar`, {
    method: 'GET',
  });
  return Array.isArray(response) ? response : [];
};

