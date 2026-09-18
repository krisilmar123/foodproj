import { describe, it, expect, vi, beforeEach } from 'vitest';
import { photosApi } from '@/api/photosApi';

global.fetch = vi.fn();

function mockFetchResponse(
  data: unknown,
  ok = true,
  status = 200,
) {
  return vi.mocked(global.fetch).mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
  } as Response);
}

describe('photosApi', () => {
  beforeEach(() => {
    vi.mocked(global.fetch).mockReset();
  });

  describe('listPhotos', () => {
    it('fetches photos successfully', async () => {
      const mockPhotos = [
        { id: '1', image_url: 'http://example.com/1.jpg', caption: 'Dish 1' },
      ];
      mockFetchResponse(mockPhotos);

      const result = await photosApi.listPhotos();
      expect(result).toEqual(mockPhotos);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/photos'),
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });

    it('appends status filter as query param', async () => {
      mockFetchResponse([]);
      await photosApi.listPhotos({ status: 'pending' });
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('status=pending');
    });

    it('appends cuisine filter as query param', async () => {
      mockFetchResponse([]);
      await photosApi.listPhotos({ cuisine: 'Italian' });
      const url = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(url).toContain('cuisine=Italian');
    });

    it('throws on failed API request (500)', async () => {
      mockFetchResponse({ error: 'Database error' }, false, 500);
      await expect(photosApi.listPhotos()).rejects.toThrow('Database error');
    });

    it('throws on 404 with default message', async () => {
      mockFetchResponse({}, false, 404);
      await expect(photosApi.listPhotos()).rejects.toThrow(
        'Request failed (404)',
      );
    });

    it('throws on network error', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(photosApi.listPhotos()).rejects.toThrow('Failed to fetch');
    });
  });

  describe('getPhoto', () => {
    it('fetches a single photo by id', async () => {
      const mockPhoto = { id: 'abc', caption: 'Dish' };
      mockFetchResponse(mockPhoto);
      const result = await photosApi.getPhoto('abc');
      expect(result).toEqual(mockPhoto);
    });

    it('throws on 404', async () => {
      mockFetchResponse({ error: 'Photo not found' }, false, 404);
      await expect(photosApi.getPhoto('xyz')).rejects.toThrow('Photo not found');
    });
  });

  describe('updateReviewStatus', () => {
    it('sends PATCH request with correct payload', async () => {
      const mockUpdated = {
        id: 'abc',
        review_status: 'approved',
        review_notes: 'Great',
      };
      mockFetchResponse(mockUpdated);
      const result = await photosApi.updateReviewStatus('abc', {
        review_status: 'approved',
        review_notes: 'Great',
      });
      expect(result).toEqual(mockUpdated);

      const call = vi.mocked(global.fetch).mock.calls[0];
      expect(call[1]?.method).toBe('PATCH');
      expect(JSON.parse(call[1]?.body as string)).toEqual({
        review_status: 'approved',
        review_notes: 'Great',
      });
    });

    it('throws on 400 for invalid status', async () => {
      mockFetchResponse(
        { error: 'Invalid review_status. Must be one of: pending, approved, rejected' },
        false,
        400,
      );
      await expect(
        photosApi.updateReviewStatus('abc', {
          review_status: 'approved',
        }),
      ).rejects.toThrow('Invalid review_status');
    });

    it('throws on 500 server error', async () => {
      mockFetchResponse({ error: 'Failed to update photo' }, false, 500);
      await expect(
        photosApi.updateReviewStatus('abc', { review_status: 'rejected' }),
      ).rejects.toThrow('Failed to update photo');
    });

    it('throws on network failure', async () => {
      vi.mocked(global.fetch).mockRejectedValue(
        new TypeError('Network error'),
      );
      await expect(
        photosApi.updateReviewStatus('abc', { review_status: 'approved' }),
      ).rejects.toThrow('Network error');
    });
  });
});
