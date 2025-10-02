import {
  ApiArrayResponse,
  ApiSingleResponse,
  DeepPartial,
  EntityId,
  Review,
  ReviewAttributes,
  ReviewInput,
  UserId,
} from '@/types';

import { APIEndpoints } from './endpoints';
import { apiRequest } from './client';
import { handleError } from './errors';

// ============================================================================
// REVIEWS API - Direct API layer
// ============================================================================

/**
 * Get reviews for a profile
 */
export async function getProfileReviews(
  profileId: UserId,
  token?: string
): Promise<ApiArrayResponse<Review>> {
  try {
    const { endpoint, method } = APIEndpoints.reviews.index(profileId);
    const { responseData } = await apiRequest<ApiArrayResponse<Review>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(
      error,
      `Error fetching reviews for profile ${profileId}`
    );
  }
}

/**
 * Get a single review
 */
export async function getReview(
  profileId: UserId,
  reviewId: EntityId,
  token?: string
): Promise<ApiSingleResponse<Review>> {
  try {
    const { endpoint, method } = APIEndpoints.reviews.show(reviewId);
    const { responseData } = await apiRequest<ApiSingleResponse<Review>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error fetching review ${reviewId}`);
  }
}

/**
 * Create a review for a profile
 */
export async function createReview(
  profileId: UserId,
  data: ReviewInput,
  token?: string
): Promise<ApiSingleResponse<Review>> {
  try {
    const { endpoint, method } = APIEndpoints.reviews.create(profileId);
    const { responseData } = await apiRequest<ApiSingleResponse<Review>>({
      endpoint,
      method,
      token,
      body: JSON.stringify({ review: data }),
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error creating review for profile ${profileId}`);
  }
}

/**
 * Update a review
 */
export async function updateReview(
  profileId: UserId,
  reviewId: EntityId,
  data: DeepPartial<ReviewAttributes>,
  token?: string
): Promise<ApiSingleResponse<Review>> {
  try {
    const { endpoint, method } = APIEndpoints.reviews.update(reviewId);
    const { responseData } = await apiRequest<ApiSingleResponse<Review>>({
      endpoint,
      method,
      token,
      body: JSON.stringify({ review: data }),
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error updating review ${reviewId}`);
  }
}

/**
 * Delete a review
 */
export async function deleteReview(
  profileId: UserId,
  reviewId: EntityId,
  token?: string
): Promise<void> {
  try {
    const { endpoint, method } = APIEndpoints.reviews.destroy(reviewId);
    await apiRequest({
      endpoint,
      method,
      token,
    });
  } catch (error) {
    handleError(error, `Error deleting review ${reviewId}`);
  }
}

/**
 * Vote on a review (helpful/not helpful)
 */
export async function voteOnReview(
  profileId: UserId,
  reviewId: EntityId,
  token?: string
): Promise<ApiSingleResponse<Review>> {
  try {
    const { endpoint, method } = APIEndpoints.reviews.vote(profileId, reviewId);
    const { responseData } = await apiRequest<ApiSingleResponse<Review>>({
      endpoint,
      method,
      token,
    });
    return responseData;
  } catch (error) {
    return handleError(error, `Error voting on review ${reviewId}`);
  }
}
