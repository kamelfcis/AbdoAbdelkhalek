import * as repo from './squash.repository.js';
import { findUserById } from '../shared/auth/user.repository.js';
import type { TokenPayload } from '../shared/auth/jwt.js';
import type { ListQueryFilters, PaginationParams } from '../../common/utils/pagination.js';

export async function listCategories(
  user?: TokenPayload,
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  if (!user) return repo.listSquashCategoriesPublic(pagination, filters);
  const dbUser = await findUserById(user.sub);
  if (dbUser?.isCoach) return repo.listSquashCategoriesAll(pagination, filters);
  return repo.listSquashAccessibleCategories(user.sub);
}

export async function listVideos(
  user?: TokenPayload,
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  if (!user) return repo.listSquashVideosPublic(pagination, filters);
  const dbUser = await findUserById(user.sub);
  if (dbUser?.isCoach) return repo.listSquashVideosAll(pagination, filters);
  return repo.listSquashAccessibleVideos(user.sub);
}

export async function listPackages(pagination?: PaginationParams, filters?: ListQueryFilters) {
  return repo.listSquashPackagesActive(pagination, filters);
}

export async function listReviews(pagination?: PaginationParams, filters?: ListQueryFilters) {
  return repo.listSquashReviewsPublic(pagination, filters);
}

export async function listSuccessStories(
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  return repo.listSquashSuccessStoriesPublic(pagination, filters);
}

export async function listFaqs(pagination?: PaginationParams, filters?: ListQueryFilters) {
  return repo.listSquashFaqsPublic(pagination, filters);
}

export async function listCoaches(
  user?: TokenPayload,
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  if (!user) return repo.listSquashCoachesPublic(pagination, filters);
  const dbUser = await findUserById(user.sub);
  if (dbUser?.isCoach) return repo.listSquashCoachesAll(pagination, filters);
  return repo.listSquashCoachesPublic(pagination, filters);
}

export async function listPrograms(
  user?: TokenPayload,
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  if (!user) return repo.listSquashProgramsPublic(pagination, filters);
  const dbUser = await findUserById(user.sub);
  if (dbUser?.isCoach) return repo.listSquashProgramsAll(pagination, filters);
  return repo.listSquashProgramsPublic(pagination, filters);
}

export async function getDashboardStats() {
  return repo.getSquashDashboardStats();
}

export async function listSubscriptions(
  user: TokenPayload,
  pagination?: PaginationParams,
  filters?: ListQueryFilters
) {
  return repo.listSquashSubscriptions(user.sub, user.isCoach ?? false, pagination, filters);
}

export async function listTrainees(pagination?: PaginationParams, filters?: ListQueryFilters) {
  return repo.listSquashTrainees(pagination, filters);
}

export const createCategory = repo.createSquashCategory;
export const updateCategory = repo.updateSquashCategory;
export const deleteCategory = repo.deleteSquashCategory;
export const createVideo = repo.createSquashVideo;
export const updateVideo = repo.updateSquashVideo;
export const deleteVideo = repo.deleteSquashVideo;
export const createPackage = repo.createSquashPackage;
export const updatePackage = repo.updateSquashPackage;
export const deletePackage = repo.deleteSquashPackage;
export const createReview = repo.createSquashReview;
export const updateReview = repo.updateSquashReview;
export const deleteReview = repo.deleteSquashReview;
export const createSuccessStory = repo.createSquashSuccessStory;
export const updateSuccessStory = repo.updateSquashSuccessStory;
export const deleteSuccessStory = repo.deleteSquashSuccessStory;
export const createFaq = repo.createSquashFaq;
export const updateFaq = repo.updateSquashFaq;
export const deleteFaq = repo.deleteSquashFaq;
export const createCoach = repo.createSquashCoach;
export const updateCoach = repo.updateSquashCoach;
export const deleteCoach = repo.deleteSquashCoach;
export const createProgram = repo.createSquashProgram;
export const updateProgram = repo.updateSquashProgram;
export const deleteProgram = repo.deleteSquashProgram;
export const getVideoAccessUserIds = repo.getSquashVideoAccessUserIds;
export const setVideoAccessUserIds = repo.setSquashVideoAccessUserIds;
export const getTraineeAccess = repo.getSquashTraineeAccess;
export const setTraineeAccess = repo.setSquashTraineeAccess;
