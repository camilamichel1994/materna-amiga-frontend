import { apiRequest } from '../api';

export interface Reviewer {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  reviewer: Reviewer;
  created_at: string;
}

export interface ReviewDetail extends ReviewItem {
  reviewedUserId: string;
}

export interface ReviewsMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ReviewsByUserResponse {
  items: ReviewItem[];
  averageRating: number;
  meta: ReviewsMeta;
}

export interface CreateReviewInput {
  reviewed_user_id: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

export interface CreatedReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const getReviewsByUserService = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<ReviewsByUserResponse> => {
  const queryString = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiRequest<ReviewsByUserResponse>(
    `/reviews/user/${userId}?${queryString.toString()}`,
    { method: 'GET' }
  );
};

export const getReviewByIdService = async (id: string): Promise<ReviewDetail> => {
  return apiRequest<ReviewDetail>(`/reviews/${id}`, {
    method: 'GET',
  });
};

export const createReviewService = async (data: CreateReviewInput): Promise<CreatedReview> => {
  return apiRequest<CreatedReview>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: true,
  });
};

export const updateReviewService = async (id: string, data: UpdateReviewInput): Promise<CreatedReview> => {
  return apiRequest<CreatedReview>(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    requireAuth: true,
  });
};

export const deleteReviewService = async (id: string): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(`/reviews/${id}`, {
    method: 'DELETE',
    requireAuth: true,
  });
};
