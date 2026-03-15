import { apiRequest } from '../api';

export interface TransactionListingSummary {
  id: string;
  name: string;
  price: number | null;
  photo: string | null;
}

export interface TransactionListingDetail {
  id: string;
  name: string;
  price: number | null;
  photos: string[];
}

export interface TransactionUserSummary {
  id: string;
  name: string;
}

export interface TransactionUserDetail {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface TransactionItem {
  id: string;
  listing: TransactionListingSummary;
  buyer: TransactionUserSummary;
  seller: TransactionUserSummary;
  role: 'buyer' | 'seller';
  created_at: string;
}

export interface TransactionDetail {
  id: string;
  listing: TransactionListingDetail;
  buyer: TransactionUserDetail;
  seller: TransactionUserDetail;
  role: 'buyer' | 'seller';
  created_at: string;
}

export interface TransactionsMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface TransactionsByUserResponse {
  items: TransactionItem[];
  meta: TransactionsMeta;
}

export interface CreateTransactionInput {
  listing_id: string;
}

export interface CreatedTransaction {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
}

export const getTransactionsService = async (
  page: number = 1,
  limit: number = 10
): Promise<TransactionsByUserResponse> => {
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiRequest<TransactionsByUserResponse>(
    `/transactions?${queryString.toString()}`,
    { method: 'GET', requireAuth: true }
  );
};

export const getTransactionByIdService = async (id: string): Promise<TransactionDetail> => {
  return apiRequest<TransactionDetail>(`/transactions/${id}`, {
    method: 'GET',
    requireAuth: true,
  });
};

export const createTransactionService = async (data: CreateTransactionInput): Promise<CreatedTransaction> => {
  return apiRequest<CreatedTransaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: true,
  });
};

export const deleteTransactionService = async (id: string): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(`/transactions/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
};
