import { apiFetch } from './apiClient';
import { createDomainContentService } from './createDomainContentService';

const baseService = createDomainContentService('');

interface ApiUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  isCoach?: boolean;
}

export const contentService = {
  ...baseService,

  getUserProfile: async (userId: string) => {
    const { user } = await apiFetch<{ user: ApiUser }>('/auth/me');
    if (user?.id !== userId) return { data: null, error: null };
    return {
      data: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        is_coach: user.isCoach,
      },
      error: null,
    };
  },

  getProfileDetails: () => apiFetch('/profile'),
};
