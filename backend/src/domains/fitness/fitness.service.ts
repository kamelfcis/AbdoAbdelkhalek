import * as repo from './fitness.repository.js';

import { findUserById } from '../shared/auth/user.repository.js';

import type { TokenPayload } from '../shared/auth/jwt.js';

import type { ListQueryFilters, PaginationParams } from '../../common/utils/pagination.js';



export async function listCategories(

  user?: TokenPayload,

  pagination?: PaginationParams,

  filters?: ListQueryFilters

) {

  if (!user) return repo.listCategoriesPublic(pagination, filters);

  const dbUser = await findUserById(user.sub);

  if (dbUser?.isCoach) return repo.listCategoriesAll(pagination, filters);

  return repo.listAccessibleCategories(user.sub);

}



export async function listVideos(

  user?: TokenPayload,

  pagination?: PaginationParams,

  filters?: ListQueryFilters

) {

  if (!user) return repo.listVideosPublic(pagination, filters);

  const dbUser = await findUserById(user.sub);

  if (dbUser?.isCoach || user.isCoach) return repo.listVideosAll(pagination, filters);

  return repo.listAccessibleVideos(user.sub);

}



export async function listPackages(pagination?: PaginationParams, filters?: ListQueryFilters) {

  return repo.listPackagesActive(pagination, filters);

}



export async function listReviews(pagination?: PaginationParams, filters?: ListQueryFilters) {

  return repo.listReviewsPublic(pagination, filters);

}



export async function listSuccessStories(

  pagination?: PaginationParams,

  filters?: ListQueryFilters

) {

  return repo.listSuccessStoriesPublic(pagination, filters);

}



export async function listFaqs(pagination?: PaginationParams, filters?: ListQueryFilters) {

  return repo.listFaqsPublic(pagination, filters);

}



export async function listSubscriptions(

  user: TokenPayload,

  pagination?: PaginationParams,

  filters?: ListQueryFilters

) {

  return repo.listSubscriptions(user.sub, user.isCoach ?? false, pagination, filters);

}



export async function listTrainees(pagination?: PaginationParams, filters?: ListQueryFilters) {

  return repo.listTrainees(pagination, filters);

}



export async function getDashboardStats() {

  return repo.getDashboardStats();

}



export async function getProfile(userId: string) {

  const [{ user, subscriptions }, accessibleVideos, accessibleCategories] = await Promise.all([
    repo.getUserProfileDetails(userId).then(({ user, subscriptions }) => ({ user, subscriptions })),
    repo.listAccessibleVideos(userId),
    repo.listAccessibleCategories(userId),
  ]);

  return {

    userData: user

      ? {

          full_name: user.fullName,

          email: user.email,

          phone: user.phone,

          created_at: user.createdAt,

          is_coach: user.isCoach,

        }

      : null,

    videoCount: accessibleVideos.length,

    categoryCount: accessibleCategories.length,

    subscriptions: subscriptions.map((s) => ({

      id: s.id,

      status: s.status,

      start_date: s.startDate,

      end_date: s.endDate,

      created_at: s.createdAt,

      packages: s.package

        ? {

            id: (s.package as { id?: string }).id,

            name_en:

              (s.package as { name_en?: string; nameEn?: string }).name_en ??

              (s.package as { nameEn?: string }).nameEn,

            name_ar:

              (s.package as { name_ar?: string; nameAr?: string }).name_ar ??

              (s.package as { nameAr?: string }).nameAr,

            duration_days:

              (s.package as { duration_days?: number; durationDays?: number }).duration_days ??

              (s.package as { durationDays?: number }).durationDays,

          }

        : null,

    })),

  };

}



export const createCategory = repo.createCategory;

export const updateCategory = repo.updateCategory;

export const deleteCategory = repo.deleteCategory;

export const createVideo = repo.createVideo;

export const updateVideo = repo.updateVideo;

export const deleteVideo = repo.deleteVideo;

export const createPackage = repo.createPackage;

export const updatePackage = repo.updatePackage;

export const deletePackage = repo.deletePackage;

export const createReview = repo.createReview;

export const updateReview = repo.updateReview;

export const deleteReview = repo.deleteReview;

export const createSuccessStory = repo.createSuccessStory;

export const updateSuccessStory = repo.updateSuccessStory;

export const deleteSuccessStory = repo.deleteSuccessStory;

export const createFaq = repo.createFaq;

export const updateFaq = repo.updateFaq;

export const deleteFaq = repo.deleteFaq;

export const createSubscription = repo.createSubscription;

export const updateSubscription = repo.updateSubscription;

export const deleteSubscription = repo.deleteSubscription;

export const deleteTrainee = repo.deleteTrainee;

export const getVideoAccessUserIds = repo.getVideoAccessUserIds;

export const setVideoAccessUserIds = repo.setVideoAccessUserIds;

export const getTraineeAccess = repo.getTraineeAccess;

export const setTraineeAccess = repo.setTraineeAccess;

