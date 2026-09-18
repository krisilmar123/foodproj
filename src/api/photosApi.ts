import type { FoodPhoto, ReviewStatus, UpdateReviewPayload } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function getDefaultHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ANON_KEY}`,
    apikey: ANON_KEY,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body && typeof body.error === 'string') {
        message = body.error;
      }
    } catch {
      // response body wasn't JSON — use the status-based message
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export const photosApi = {
  async listPhotos(filters?: {
    status?: ReviewStatus;
    cuisine?: string;
  }): Promise<FoodPhoto[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.cuisine) params.set('cuisine', filters.cuisine);

    const query = params.toString();
    const url = `${API_BASE_URL}/photos${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      headers: getDefaultHeaders(),
    });
    return parseResponse<FoodPhoto[]>(response);
  },

  async getPhoto(id: string): Promise<FoodPhoto> {
    const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
      headers: getDefaultHeaders(),
    });
    return parseResponse<FoodPhoto>(response);
  },

  async updateReviewStatus(
    id: string,
    payload: UpdateReviewPayload,
  ): Promise<FoodPhoto> {
    const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
      method: 'PATCH',
      headers: getDefaultHeaders(),
      body: JSON.stringify(payload),
    });
    return parseResponse<FoodPhoto>(response);
  },
};
