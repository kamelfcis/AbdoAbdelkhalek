import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { contentService } from '../services/contentService';
import { uploadService } from '../services/uploadService';
import { CDN_BASE, cdnUrl } from '../utils/cdn';
import { showSuccess, showError, showConfirm } from '../utils/notifications';
import { getTranslation } from '../utils/translations';
import { useDebounceValue } from '../utils/debounce';
import OptimizedImage from '../components/OptimizedImage';
import CategoryFormModal from './dashboard/CategoryFormModal';
import VideoFormModal from './dashboard/VideoFormModal';
import PackageFormModal from './dashboard/PackageFormModal';
import SuccessStoryFormModal from './dashboard/SuccessStoryFormModal';
import FAQFormModal from './dashboard/FAQFormModal';
import ReviewFormModal from './dashboard/ReviewFormModal';
import TraineeAccessModal from './dashboard/TraineeAccessModal';
import VideoAccessModal from './dashboard/VideoAccessModal';
import VideoPreviewModal from './dashboard/VideoPreviewModal';
import { useDashboardStats, useRecentActivities } from '../hooks/useDashboardStats';
import { useDashboardCategories } from '../hooks/useDashboardCategories';
import { useDashboardVideos } from '../hooks/useDashboardVideos';
import { useDashboardPackages } from '../hooks/useDashboardPackages';
import { useTrainees } from '../hooks/useTrainees';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useDashboardSuccessStories } from '../hooks/useDashboardSuccessStories';
import { useDashboardFAQs } from '../hooks/useDashboardFAQs';
import { useDashboardReviews } from '../hooks/useDashboardReviews';
import { useTraineeVideos } from '../hooks/useTraineeVideos';
import { StatsCardGrid, TableSkeleton, CardGridSkeleton, ListSkeleton } from '../components/Skeletons';
import {
  queryKeys,
  invalidateContentCrud,
  invalidateAccessCrud,
  invalidateDashboardSession,
} from '../lib/queryKeys';
import { DashboardShell, SectionHeader } from '../shared/layout';
import { StatCard, Button, Input, Select, Table, Badge, EmptyState, Modal } from '../shared/ui';

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: userData, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentSection, setCurrentSection] = useState(() => {
    // Check URL parameter for section, default to 'overview'
    const sectionParam = searchParams.get('section');
    return sectionParam || 'overview';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed, user can toggle
  const [logoutLoading, setLogoutLoading] = useState(false);

  const authQueryOpts = { enabled: Boolean(userData?.is_coach) };
  
  // TanStack Query hooks - data is automatically cached
  const { data: stats = {
    trainees: 0,
    videos: 0,
    packages: 0,
    categories: 0,
    activeSubscriptions: 0,
    totalSubscriptions: 0,
    successStories: 0,
    reviews: 0,
    faqs: 0,
    publicVideos: 0,
    privateVideos: 0
  }, isLoading: statsLoading } = useDashboardStats(authQueryOpts);
  
  const { data: categories = [], isLoading: categoriesLoading } = useDashboardCategories(authQueryOpts);
  const { data: videos = [], isLoading: videosLoading } = useDashboardVideos(authQueryOpts);
  const { data: packages = [], isLoading: packagesLoading } = useDashboardPackages(authQueryOpts);
  const { data: trainees = [], isLoading: traineesLoading } = useTrainees(authQueryOpts);
  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useSubscriptions(authQueryOpts);
  const { data: successStories = [], isLoading: successStoriesLoading } = useDashboardSuccessStories(authQueryOpts);
  const { data: faqs = [], isLoading: faqsLoading } = useDashboardFAQs(authQueryOpts);
  const { data: reviews = [], isLoading: reviewsLoading } = useDashboardReviews(authQueryOpts);
  const { data: recentActivities = [], isLoading: recentActivitiesLoading } = useRecentActivities(currentLanguage, authQueryOpts);
  
  // For trainees, fetch their accessible videos
  // Only fetch if userData is loaded and user is a trainee
  const isTrainee = userData && !userData.is_coach;
  const traineeUserId = isTrainee ? userData?.id : null;
  const { data: traineeVideos = [], isLoading: traineeVideosLoading, error: traineeVideosError } = useTraineeVideos(traineeUserId);
  
  // Determine loading state based on current section
  const loading = useMemo(() => {
    switch (currentSection) {
      case 'overview': return statsLoading;
      case 'categories': return categoriesLoading;
      case 'videos': return videosLoading;
      case 'packages': return packagesLoading;
      case 'trainees': return traineesLoading;
      case 'subscriptions': return subscriptionsLoading;
      case 'success-stories': return successStoriesLoading;
      case 'faqs': return faqsLoading;
      case 'reviews': return reviewsLoading;
      default: return false;
    }
  }, [currentSection, statsLoading, categoriesLoading, videosLoading, packagesLoading, traineesLoading, subscriptionsLoading, successStoriesLoading, faqsLoading, reviewsLoading]);

  // Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [showTraineeAccessModal, setShowTraineeAccessModal] = useState(false);
  const [activeTrainee, setActiveTrainee] = useState(null);
  const [showVideoAccessModal, setShowVideoAccessModal] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [showConvertToSubscriptionModal, setShowConvertToSubscriptionModal] = useState(false);
  const [traineeForConversion, setTraineeForConversion] = useState(null);
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [reviewSearch, setReviewSearch] = useState('');
  const [storySearch, setStorySearch] = useState('');
  const [storyStatusFilter, setStoryStatusFilter] = useState('all');
  const [storyFeaturedFilter, setStoryFeaturedFilter] = useState('all');
  const [packageSearch, setPackageSearch] = useState('');
  const [videoSearch, setVideoSearch] = useState('');
  const [videoCategoryFilter, setVideoCategoryFilter] = useState('all');
  const [videoStatusFilter, setVideoStatusFilter] = useState('all');
  const [videoPage, setVideoPage] = useState(1);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [previewVideoLoading, setPreviewVideoLoading] = useState(false);
  const [previewVideoError, setPreviewVideoError] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState('all');
  
  // Trainee video filtering states
  const [traineeVideoSearch, setTraineeVideoSearch] = useState('');
  const debouncedTraineeVideoSearch = useDebounceValue(traineeVideoSearch, 300); // Debounce search for better performance
  const [traineeVideoCategoryFilter, setTraineeVideoCategoryFilter] = useState('all');
  const [traineeCurrentSection, setTraineeCurrentSection] = useState('videos'); // 'videos' or 'favorites'
  const [filtersExpanded, setFiltersExpanded] = useState(true); // Filter panel expanded/collapsed state
  const [traineeVideosPage, setTraineeVideosPage] = useState(1);
  const [favoriteVideosPage, setFavoriteVideosPage] = useState(1);
  const videosPerPage = 9; // Number of videos per page
  
  // Favorites state - load from localStorage
  const [favoriteVideoIds, setFavoriteVideoIds] = useState(() => {
    try {
      const saved = localStorage.getItem('traineeFavoriteVideos');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      return [];
    }
  });
  
  // Save favorites to localStorage whenever it changes (debounced to reduce writes)
  const favoriteVideoIdsRef = useRef(favoriteVideoIds);
  useEffect(() => {
    favoriteVideoIdsRef.current = favoriteVideoIds;
  }, [favoriteVideoIds]);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
    try {
        localStorage.setItem('traineeFavoriteVideos', JSON.stringify(favoriteVideoIdsRef.current));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
    }, 500); // Debounce localStorage writes to reduce I/O operations
    
    return () => clearTimeout(timeoutId);
  }, [favoriteVideoIds]);
  
  // Toggle favorite
  const toggleFavorite = useCallback((videoId) => {
    setFavoriteVideoIds(prev => {
      const videoIdStr = String(videoId);
      if (prev.includes(videoIdStr)) {
        return prev.filter(id => id !== videoIdStr);
      } else {
        return [...prev, videoIdStr];
      }
    });
  }, []);
  
  // Check if video is favorite
  const isFavorite = useCallback((videoId) => {
    return favoriteVideoIds.includes(String(videoId));
  }, [favoriteVideoIds]);

  // Filter trainee videos - must be before any conditional returns
  // Use debounced search for better performance (reduces re-renders)
  const filteredTraineeVideos = useMemo(() => {
    let filtered = traineeVideos;

    // Category filter
    if (traineeVideoCategoryFilter !== 'all') {
      filtered = filtered.filter(video => String(video.category_id) === String(traineeVideoCategoryFilter));
    }

    // Search filter (using debounced value)
    if (debouncedTraineeVideoSearch) {
      const searchLower = debouncedTraineeVideoSearch.toLowerCase();
      filtered = filtered.filter(
        video =>
          (video.title_en && video.title_en.toLowerCase().includes(searchLower)) ||
          (video.title_ar && video.title_ar.toLowerCase().includes(searchLower)) ||
          (video.description_en && video.description_en.toLowerCase().includes(searchLower)) ||
          (video.description_ar && video.description_ar.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [traineeVideos, traineeVideoCategoryFilter, debouncedTraineeVideoSearch]);

  // Get unique categories from trainee videos - must be before any conditional returns
  const traineeVideoCategories = useMemo(() => {
    const categoryMap = new Map();
    traineeVideos.forEach((video) => {
      if (video.category_id && video.categories) {
        const catId = String(video.category_id);
        if (!categoryMap.has(catId)) {
          categoryMap.set(catId, {
            id: catId,
            name_en: video.categories.name_en || '',
            name_ar: video.categories.name_ar || ''
          });
        }
      }
    });
    return Array.from(categoryMap.values());
  }, [traineeVideos]);
  
  // Get favorite videos
  const favoriteVideos = useMemo(() => {
    return traineeVideos.filter(video => favoriteVideoIds.includes(String(video.id)));
  }, [traineeVideos, favoriteVideoIds]);
  
  // Filter favorite videos (using debounced search)
  const filteredFavoriteVideos = useMemo(() => {
    let filtered = favoriteVideos;

    // Category filter
    if (traineeVideoCategoryFilter !== 'all') {
      filtered = filtered.filter(video => String(video.category_id) === String(traineeVideoCategoryFilter));
    }

    // Search filter (using debounced value)
    if (debouncedTraineeVideoSearch) {
      const searchLower = debouncedTraineeVideoSearch.toLowerCase();
      filtered = filtered.filter(
        video =>
          (video.title_en && video.title_en.toLowerCase().includes(searchLower)) ||
          (video.title_ar && video.title_ar.toLowerCase().includes(searchLower)) ||
          (video.description_en && video.description_en.toLowerCase().includes(searchLower)) ||
          (video.description_ar && video.description_ar.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [favoriteVideos, traineeVideoCategoryFilter, debouncedTraineeVideoSearch]);

  // Paginated videos for "My Videos" section
  const paginatedTraineeVideos = useMemo(() => {
    const startIndex = (traineeVideosPage - 1) * videosPerPage;
    const endIndex = startIndex + videosPerPage;
    return filteredTraineeVideos.slice(startIndex, endIndex);
  }, [filteredTraineeVideos, traineeVideosPage, videosPerPage]);

  // Paginated videos for "My Favorites" section
  const paginatedFavoriteVideos = useMemo(() => {
    const startIndex = (favoriteVideosPage - 1) * videosPerPage;
    const endIndex = startIndex + videosPerPage;
    return filteredFavoriteVideos.slice(startIndex, endIndex);
  }, [filteredFavoriteVideos, favoriteVideosPage, videosPerPage]);

  // Calculate total pages
  const totalTraineeVideosPages = Math.ceil(filteredTraineeVideos.length / videosPerPage);
  const totalFavoriteVideosPages = Math.ceil(filteredFavoriteVideos.length / videosPerPage);

  // Reset page to 1 when filters change (using debounced search)
  useEffect(() => {
    setTraineeVideosPage(1);
    setFavoriteVideosPage(1);
  }, [debouncedTraineeVideoSearch, traineeVideoCategoryFilter, traineeCurrentSection]);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      if (category?.id) {
        map.set(category.id, category);
      }
    });
    return map;
  }, [categories]);

  const editingCategory = useMemo(
    () => (editingCategoryId ? categories.find((category) => category.id === editingCategoryId) || null : null),
    [editingCategoryId, categories]
  );

  const editingVideo = useMemo(
    () => (editingVideoId ? videos.find((item) => item.id === editingVideoId) || null : null),
    [editingVideoId, videos]
  );

  const editingPackage = useMemo(
    () => (editingPackageId ? packages.find((item) => item.id === editingPackageId) || null : null),
    [editingPackageId, packages]
  );

  const editingStory = useMemo(
    () => (editingStoryId ? successStories.find((item) => item.id === editingStoryId) || null : null),
    [editingStoryId, successStories]
  );

  const editingFaq = useMemo(
    () => (editingFaqId ? faqs.find((item) => item.id === editingFaqId) || null : null),
    [editingFaqId, faqs]
  );

  const editingReview = useMemo(
    () => (editingReviewId ? reviews.find((item) => item.id === editingReviewId) || null : null),
    [editingReviewId, reviews]
  );

  const isAbsoluteUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value);

  const sanitizeStorageValue = (value) => {
    if (typeof value !== 'string') return null;
    return value.trim().replace(/^['"]|['"]$/g, '') || null;
  };

  const SUPABASE_PUBLIC_BASE = CDN_BASE;

  const buildSupabasePublicUrl = (bucket, path) => {
    if (!path) return null;
    const trimmedPath = path.replace(/^\/+/, '');
    const bucketPrefixRegex = new RegExp(`^${bucket}/`, 'i');
    const sanitized = trimmedPath.replace(bucketPrefixRegex, '');
    return `${SUPABASE_PUBLIC_BASE}/${bucket}/${sanitized}`;
  };

  const normalizeSupabasePublicUrl = (url, bucket) => {
    if (!url) return null;
    const [, path] = url.split(SUPABASE_PUBLIC_BASE);
    return `${SUPABASE_PUBLIC_BASE}/${bucket}/${path}`;
  };

  const resolveSuccessStoryImage = (story, type) => {
    if (!story) return null;
    if (story[`${type}_image_url`]) return story[`${type}_image_url`];
    if (story[`${type}_image_path`]) {
      return cdnUrl('success-stories', story[`${type}_image_path`]);
    }
    return null;
  };

  const formatDateTime = (value) => {
    if (!value) return currentLanguage === 'ar' ? 'غير محدد' : 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return currentLanguage === 'ar' ? 'غير صالح' : 'Invalid';
    return date.toLocaleString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const formatDurationSeconds = (seconds) => {
    if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) {
      return currentLanguage === 'ar' ? 'غير متاح' : 'N/A';
    }
    const totalSeconds = Math.max(0, Math.floor(Number(seconds)));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredReviews = useMemo(() => {
    const searchLower = reviewSearch.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesStatus =
        reviewStatusFilter === 'all'
          ? true
          : (reviewStatusFilter === 'public' && review.is_public) ||
            (reviewStatusFilter === 'private' && !review.is_public);

      if (!matchesStatus) return false;

      if (!searchLower) return true;

      const source =
        `${review.image_path || ''} ${review.image_url || ''} ${review.display_order ?? ''}`.toLowerCase();

      return source.includes(searchLower);
    });
  }, [reviews, reviewStatusFilter, reviewSearch]);

  const filteredSuccessStories = useMemo(() => {
    const searchLower = storySearch.trim().toLowerCase();
    return successStories.filter((story) => {
      const matchesStatus =
        storyStatusFilter === 'all'
          ? true
          : (storyStatusFilter === 'public' && story.is_public) ||
            (storyStatusFilter === 'private' && !story.is_public);

      const matchesFeatured =
        storyFeaturedFilter === 'all'
          ? true
          : (storyFeaturedFilter === 'featured' && story.is_featured) ||
            (storyFeaturedFilter === 'regular' && !story.is_featured);

      if (!matchesStatus || !matchesFeatured) return false;

      if (!searchLower) return true;

      const source = `${story.title_en || ''} ${story.title_ar || ''} ${story.content_en || ''} ${story.content_ar || ''}`.toLowerCase();
      return source.includes(searchLower);
    });
  }, [successStories, storySearch, storyStatusFilter, storyFeaturedFilter]);

  const filteredPackages = useMemo(() => {
    const searchLower = packageSearch.trim().toLowerCase();
    return packages.filter((pkg) => {
      if (!searchLower) return true;
      const source = `${pkg.name_en || ''} ${pkg.name_ar || ''} ${pkg.description_en || ''} ${pkg.description_ar || ''}`.toLowerCase();
      return source.includes(searchLower);
    });
  }, [packages, packageSearch]);

  const translations = {
    en: {
      'dashboard-title': 'Coach Dashboard',
      'welcome-text': 'Welcome back!',
      'nav-overview': 'Overview',
      'nav-categories': 'Categories',
      'nav-videos': 'Videos',
      'nav-subscriptions': 'Subscriptions',
      'nav-packages': 'Packages',
      'nav-trainees': 'Trainees',
      'nav-success': 'Success Stories',
      'nav-faqs': 'FAQs Management',
      'nav-reviews': 'Reviews',
      'logout-text': 'Logout',
      'total-trainees-label': 'Total Trainees',
      'total-videos-label': 'Total Videos',
      'total-packages-label': 'Total Packages',
      'total-categories-label': 'Total Categories',
      'active-subscriptions-label': 'Active Subscriptions',
      'total-subscriptions-label': 'Total Subscriptions',
      'success-stories-label': 'Success Stories',
      'reviews-label': 'Reviews',
      'faqs-label': 'FAQs',
      'public-videos-label': 'Public Videos',
      'private-videos-label': 'Private Videos',
      'quick-shortcuts-title': 'Quick Shortcuts',
      'recent-activity-title': 'Recent Activity',
      'no-activity': 'No recent activity',
      'add-new': 'Add New',
      'view-all': 'View All',
      'categories-title': 'Categories Management',
      'add-category-text': 'Add Category',
      'videos-title': 'Videos Management',
      'add-video-text': 'Add Video',
      'th-name': 'Name',
      'th-description': 'Description',
      'th-public': 'Public',
      'th-actions': 'Actions',
      'th-video-title': 'Title',
      'th-category': 'Category',
    },
    ar: {
      'dashboard-title': 'لوحة تحكم المدرب',
      'welcome-text': 'مرحباً بعودتك!',
      'nav-overview': 'نظرة عامة',
      'nav-categories': 'التصنيفات',
      'nav-videos': 'الفيديوهات',
      'nav-subscriptions': 'الاشتراكات',
      'nav-packages': 'الباقات',
      'nav-trainees': 'المتدربين',
      'nav-success': 'قصص النجاح',
      'nav-faqs': 'إدارة الأسئلة الشائعة',
      'nav-reviews': 'آراء العملاء',
      'logout-text': 'تسجيل الخروج',
      'total-trainees-label': 'إجمالي المتدربين',
      'total-videos-label': 'إجمالي الفيديوهات',
      'total-packages-label': 'إجمالي الباقات',
      'total-categories-label': 'إجمالي التصنيفات',
      'active-subscriptions-label': 'الاشتراكات النشطة',
      'total-subscriptions-label': 'إجمالي الاشتراكات',
      'success-stories-label': 'قصص النجاح',
      'reviews-label': 'التقييمات',
      'faqs-label': 'الأسئلة الشائعة',
      'public-videos-label': 'فيديوهات عامة',
      'private-videos-label': 'فيديوهات خاصة',
      'quick-shortcuts-title': 'اختصارات سريعة',
      'recent-activity-title': 'النشاط الأخير',
      'no-activity': 'لا يوجد نشاط حديث',
      'add-new': 'إضافة جديد',
      'view-all': 'عرض الكل',
      'categories-title': 'إدارة التصنيفات',
      'add-category-text': 'إضافة تصنيف',
      'videos-title': 'إدارة الفيديوهات',
      'add-video-text': 'إضافة فيديو',
      'th-name': 'الاسم',
      'th-description': 'الوصف',
      'th-public': 'عام',
      'th-actions': 'الإجراءات',
      'th-video-title': 'العنوان',
      'th-category': 'التصنيف',
    }
  };

  const t = (key) => translations[currentLanguage][key] || key;

  const updateDirection = (lang) => {
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
      document.body.classList.remove('rtl');
    }
  };

  useEffect(() => {
    if (!userData?.is_coach) return;

    const sectionParam = searchParams.get('section');
    if (sectionParam) {
      setCurrentSection(sectionParam);
      setSearchParams({});
    }

    invalidateDashboardSession(queryClient);

    const savedLang = localStorage.getItem('websiteLanguage') || 'en';
    setCurrentLanguage(savedLang);
    updateDirection(savedLang);
  }, [userData, searchParams, queryClient, setSearchParams]);

  // Sidebar state changes tracking (removed debug logs for production)

  // Data is automatically loaded via TanStack Query hooks
  // No need for manual loading functions - queries are cached and refetched automatically

  // Overview data is loaded via useDashboardStats hook
  // Stats are automatically cached and updated
  // Recent activities are loaded via useRecentActivities hook

  const getTimeAgo = (dateString) => {
    if (!dateString) return currentLanguage === 'ar' ? 'غير محدد' : 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return currentLanguage === 'ar' ? 'الآن' : 'Just now';
    } else if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return currentLanguage === 'ar' ? `منذ ${mins} دقيقة` : `${mins} minute${mins > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return currentLanguage === 'ar' ? `منذ ${hours} ساعة` : `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return currentLanguage === 'ar' ? `منذ ${days} يوم` : `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // All data loading is handled by TanStack Query hooks above
  // Data is automatically cached and refetched when needed

  const handleLogout = async () => {
    // Prevent multiple clicks
    if (logoutLoading) return;

    try {
      // Show confirmation dialog
      const confirmed = await showConfirm(
        currentLanguage === 'ar' ? 'تأكيد تسجيل الخروج' : 'Confirm Logout',
        currentLanguage === 'ar' 
          ? 'هل أنت متأكد أنك تريد تسجيل الخروج؟' 
          : 'Are you sure you want to logout?',
        currentLanguage === 'ar' ? 'نعم، سجل الخروج' : 'Yes, Logout',
        currentLanguage === 'ar' ? 'إلغاء' : 'Cancel'
      );

      // If user confirms, proceed with logout
      if (confirmed) {
        setLogoutLoading(true);

        try {
          await logout();
          queryClient.clear();
          navigate('/');
        } catch (error) {
          console.error('Logout error:', error);
          queryClient.clear();
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error showing confirmation dialog:', error);
      setLogoutLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ar' : 'en';
    setCurrentLanguage(newLang);
    localStorage.setItem('websiteLanguage', newLang);
    updateDirection(newLang);
  };

  const getPageTitle = () => {
    const titles = {
      overview: currentLanguage === 'en' ? 'Dashboard Overview' : 'نظرة عامة على لوحة التحكم',
      categories: currentLanguage === 'en' ? 'Categories Management' : 'إدارة التصنيفات',
      videos: currentLanguage === 'en' ? 'Videos Management' : 'إدارة الفيديوهات',
      packages: currentLanguage === 'en' ? 'Packages Management' : 'إدارة الباقات',
      trainees: currentLanguage === 'en' ? 'Trainees Management' : 'إدارة المتدربين',
      subscriptions: currentLanguage === 'en' ? 'Subscriptions Management' : 'إدارة الاشتراكات',
      'success-stories': currentLanguage === 'en' ? 'Success Stories Management' : 'إدارة قصص النجاح',
      faqs: currentLanguage === 'en' ? 'FAQs Management' : 'إدارة الأسئلة الشائعة',
      reviews: currentLanguage === 'en' ? 'Reviews Management' : 'إدارة آراء العملاء',
    };
    return titles[currentSection] || 'Dashboard';
  };

  const isRTL = currentLanguage === 'ar';

  const coachNavItems = useMemo(
    () => [
      { key: 'overview', icon: 'chart-line', label: t('nav-overview') },
      { key: 'categories', icon: 'folder', label: t('nav-categories') },
      { key: 'videos', icon: 'video', label: t('nav-videos') },
      { key: 'subscriptions', icon: 'user-check', label: t('nav-subscriptions') },
      { key: 'packages', icon: 'box', label: t('nav-packages') },
      { key: 'trainees', icon: 'users', label: t('nav-trainees') },
      {
        key: 'success-stories',
        icon: 'trophy',
        label: getTranslation('nav-success-stories', currentLanguage),
      },
      { key: 'faqs', icon: 'question-circle', label: t('nav-faqs') },
      {
        key: 'reviews',
        icon: 'whatsapp',
        label: t('nav-reviews'),
        iconClassName: 'text-green-600',
      },
    ],
    [currentLanguage]
  );

  const traineeNavItems = useMemo(
    () => [
      {
        key: 'videos',
        icon: 'video',
        label: currentLanguage === 'ar' ? 'فيديوهاتي' : 'My Videos',
      },
      {
        key: 'favorites',
        icon: 'star',
        iconClassName: 'text-yellow-500',
        label: currentLanguage === 'ar' ? 'مفضلاتي' : 'My Favorites',
        badge: favoriteVideoIds.length,
      },
    ],
    [currentLanguage, favoriteVideoIds.length]
  );

  const viewAllLabel = currentLanguage === 'ar' ? 'عرض الكل' : 'View all';

  const filteredCategories = useMemo(() => {
    const searchLower = categorySearch.trim().toLowerCase();
    return categories.filter((category) => {
      const matchesStatus = categoryStatusFilter === 'all'
        ? true
        : categoryStatusFilter === 'public'
          ? category.is_public
          : !category.is_public;

      if (!matchesStatus) return false;

      if (!searchLower) return true;

      const source = `${category.name_en || ''} ${category.name_ar || ''} ${category.description_en || ''} ${category.description_ar || ''}`
        .toLowerCase();
      return source.includes(searchLower);
    });
  }, [categories, categorySearch, categoryStatusFilter]);

  const getCategoryLabel = (categoryId) => {
    if (!categoryId) {
      return currentLanguage === 'ar' ? 'غير محدد' : 'N/A';
    }
    const category = categoryMap.get(categoryId);
    if (!category) {
      return currentLanguage === 'ar' ? 'غير محدد' : 'N/A';
    }
    return currentLanguage === 'ar'
      ? category.name_ar || category.name_en || 'غير محدد'
      : category.name_en || category.name_ar || 'N/A';
  };

  const VIDEOS_PER_PAGE = 8;

  const filteredVideos = useMemo(() => {
    const searchLower = videoSearch.trim().toLowerCase();
    return videos.filter((video) => {
      const matchesSearch = !searchLower
        || `${video.title_en || ''} ${video.title_ar || ''} ${video.description_en || ''} ${video.description_ar || ''}`
          .toLowerCase()
          .includes(searchLower);

      const matchesCategory =
        videoCategoryFilter === 'all' || String(video.category_id) === String(videoCategoryFilter);

      const matchesStatus =
        videoStatusFilter === 'all'
          ? true
          : (videoStatusFilter === 'public' && video.is_public) ||
            (videoStatusFilter === 'private' && !video.is_public);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [videos, videoSearch, videoCategoryFilter, videoStatusFilter]);

  const totalVideoPages = Math.max(1, Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE));

  useEffect(() => {
    setVideoPage(1);
  }, [videoSearch, videoCategoryFilter, videoStatusFilter]);

  useEffect(() => {
    if (videoPage > totalVideoPages) {
      setVideoPage(totalVideoPages);
    }
  }, [videoPage, totalVideoPages]);

  const paginatedVideos = useMemo(() => {
    const startIndex = (videoPage - 1) * VIDEOS_PER_PAGE;
    return filteredVideos.slice(startIndex, startIndex + VIDEOS_PER_PAGE);
  }, [filteredVideos, videoPage]);

  const { videoStartIndex, videoEndIndex } = useMemo(() => {
    if (!filteredVideos.length) {
      return { videoStartIndex: 0, videoEndIndex: 0 };
    }
    const start = (videoPage - 1) * VIDEOS_PER_PAGE + 1;
    const end = start + paginatedVideos.length - 1;
    return { videoStartIndex: start, videoEndIndex: end };
  }, [filteredVideos.length, paginatedVideos.length, videoPage]);


  const resolveVideoAsset = (video, type) => {
    if (!video) return null;
    const urlKey = `${type}_url`;
    const pathKey = `${type}_path`;
    const bucket = type === 'thumbnail' ? 'video-thumbnails' : 'videos';

    // First, try to use the URL directly (same as edit modal does)
    const storedUrl = sanitizeStorageValue(video[urlKey]);
    if (storedUrl && storedUrl !== 'pending') {
      // If it's already a full URL, use it directly
      if (isAbsoluteUrl(storedUrl)) {
        return storedUrl;
      }
      // If it's a path, build the URL
      return buildSupabasePublicUrl(bucket, storedUrl);
    }

    // Fallback to path if URL doesn't exist
    const storedPath = sanitizeStorageValue(video[pathKey]);
    if (storedPath) {
      // If path is already a full URL, use it directly
      if (isAbsoluteUrl(storedPath)) {
        return storedPath;
      }
      // Build URL from path
      return buildSupabasePublicUrl(bucket, storedPath);
    }

    return null;
  };

  const fetchVideoAssetUrl = async (video, type) => {
    if (!video) return null;
    const urlKey = `${type}_url`;
    const pathKey = `${type}_path`;
    const bucket = type === 'thumbnail' ? 'video-thumbnails' : 'videos';

    // First, try to use the URL directly (same logic as resolveVideoAsset)
    const storedUrl = sanitizeStorageValue(video[urlKey]);
    if (storedUrl && storedUrl !== 'pending') {
      // If it's already a full URL, use it directly
      if (isAbsoluteUrl(storedUrl)) {
        return storedUrl;
      }
      // If it's a path, build the URL
      return buildSupabasePublicUrl(bucket, storedUrl);
    }

    const storedPath = sanitizeStorageValue(video[pathKey]);
    if (storedPath) {
      if (isAbsoluteUrl(storedPath)) {
        return storedPath;
      }

      const { data: publicData } = uploadService.getPublicUrl(bucket, storedPath);
      if (publicData?.publicUrl) {
        return publicData.publicUrl;
      }

      return cdnUrl(bucket, storedPath);
    }

    return null;
  };

  const handlePreviewVideo = async (video) => {
    if (!video) return;
    setPreviewVideo(video);
    setPreviewVideoUrl('');
    setPreviewVideoError('');
    setShowVideoModal(true);
    setPreviewVideoLoading(true);

    try {
      const url = await fetchVideoAssetUrl(video, 'video');
      if (!url) {
        setPreviewVideoError(currentLanguage === 'ar' ? 'تعذر تحميل ملف الفيديو.' : 'Unable to load the video file.');
      } else {
        setPreviewVideoUrl(url);
      }
    } catch (error) {
      console.error('Video preview error:', error);
      setPreviewVideoError(currentLanguage === 'ar' ? 'حدث خطأ أثناء تحميل الفيديو.' : 'An error occurred while loading the video.');
    } finally {
      setPreviewVideoLoading(false);
    }
  };

  const closeVideoPreview = useCallback(() => {
    setPreviewVideo(null);
    setPreviewVideoUrl('');
    setPreviewVideoError('');
    setPreviewVideoLoading(false);
    setShowVideoModal(false);
  }, []);

  if (loading && !userData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="loading-spinner w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Trainee view — DashboardShell + shared UI
  if (isTrainee) {
    const traineePageTitle = traineeCurrentSection === 'favorites'
      ? (currentLanguage === 'ar' ? 'مفضلاتي' : 'My Favorites')
      : (currentLanguage === 'ar' ? 'فيديوهاتي' : 'My Videos');

    return (
      <>
        <DashboardShell
          isRTL={isRTL}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          onSidebarClose={() => setSidebarOpen(false)}
          sidebarTitle={currentLanguage === 'ar' ? 'فيديوهاتي' : 'My Videos'}
          sidebarSubtitle={userData?.full_name || userData?.email || 'Trainee'}
          navItems={traineeNavItems}
          currentSection={traineeCurrentSection}
          onNavigate={setTraineeCurrentSection}
          onLogout={handleLogout}
          logoutLoading={logoutLoading}
          logoutLabel={t('logout-text')}
          loggingOutLabel={currentLanguage === 'ar' ? 'جاري تسجيل الخروج...' : 'Logging out...'}
          onToggleLanguage={toggleLanguage}
          languageToggleLabel={currentLanguage === 'en' ? 'العربية' : 'English'}
          pageTitle={traineePageTitle}
          userDisplayName={userData?.full_name || userData?.email || 'Trainee'}
          navbarExtraActions={
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-muted)] rounded-lg transition text-sm font-medium"
            >
              <i className="fas fa-home" aria-hidden="true" />
              <span>{currentLanguage === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </button>
          }
        >
          {/* Advanced Filters */}
          <div>
            <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
              {/* Header with expand/collapse button */}
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {currentLanguage === 'ar' ? 'تصفية الفيديوهات' : 'Filter Videos'}
                </h3>
                <i className={`fas fa-chevron-${filtersExpanded ? 'up' : 'down'} text-gray-500 transition-transform`}></i>
              </button>

              {/* Collapsible Content */}
              {filtersExpanded && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {currentLanguage === 'ar' ? 'البحث' : 'Search'}
                      </label>
                      <div className="relative">
                        <i className={`fas fa-search absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`}></i>
                        <input
                          type="text"
                          value={traineeVideoSearch}
                          onChange={(e) => setTraineeVideoSearch(e.target.value)}
                          placeholder={currentLanguage === 'ar' ? 'ابحث عن فيديو...' : 'Search videos...'}
                          className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]`}
                        />
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {currentLanguage === 'ar' ? 'التصنيف' : 'Category'}
                      </label>
                      <select
                        value={traineeVideoCategoryFilter}
                        onChange={(e) => setTraineeVideoCategoryFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
                      >
                        <option value="all">{currentLanguage === 'ar' ? 'كل التصنيفات' : 'All Categories'}</option>
                        {traineeVideoCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {currentLanguage === 'ar' ? category.name_ar : category.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Results count */}
                  <div className="mt-4 text-sm text-gray-600">
                    {traineeCurrentSection === 'favorites' ? (
                      currentLanguage === 'ar' 
                        ? `عرض ${filteredFavoriteVideos.length} من ${favoriteVideos.length} فيديو مفضل`
                        : `Showing ${filteredFavoriteVideos.length} of ${favoriteVideos.length} favorite videos`
                    ) : (
                      currentLanguage === 'ar' 
                        ? `عرض ${filteredTraineeVideos.length} من ${traineeVideos.length} فيديو`
                        : `Showing ${filteredTraineeVideos.length} of ${traineeVideos.length} videos`
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Videos Grid */}
          {(!userData || traineeVideosLoading) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : traineeVideosError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">
                {currentLanguage === 'ar' ? 'حدث خطأ أثناء تحميل الفيديوهات' : 'Error loading videos'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition"
              >
                {currentLanguage === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          ) : (traineeCurrentSection === 'favorites' ? paginatedFavoriteVideos : paginatedTraineeVideos).length > 0 ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(traineeCurrentSection === 'favorites' ? paginatedFavoriteVideos : paginatedTraineeVideos).map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all video-card relative"
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(video.id);
                    }}
                    className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} z-10 p-2 rounded-full transition-all ${
                      isFavorite(video.id)
                        ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                        : 'bg-white bg-opacity-80 text-gray-400 hover:bg-opacity-100 hover:text-yellow-500'
                    }`}
                    title={isFavorite(video.id) 
                      ? (currentLanguage === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites')
                      : (currentLanguage === 'ar' ? 'إضافة إلى المفضلة' : 'Add to favorites')}
                  >
                    <i className={`fas fa-star ${isFavorite(video.id) ? 'text-yellow-900' : ''}`}></i>
                  </button>
                  
                  <div
                    onClick={() => handlePreviewVideo(video)}
                    className="cursor-pointer"
                  >
                    <div className="relative bg-gray-200">
                      {(() => {
                        let thumbnailUrl = video.thumbnail_url || video.thumbnail_path;
                        if (video.thumbnail_path && !thumbnailUrl?.startsWith('http')) {
                          thumbnailUrl = cdnUrl('videos', video.thumbnail_path);
                        }
                        return thumbnailUrl ? (
                          <>
                            <OptimizedImage
                            src={thumbnailUrl} 
                            alt={currentLanguage === 'ar' ? video.title_ar : video.title_en} 
                              className="w-full h-auto object-cover"
                              width={800}
                              height={450}
                            loading="lazy"
                              priority={false}
                              onError={() => {}}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition pointer-events-auto cursor-pointer">
                          <i className="fas fa-play text-[var(--color-primary)] text-2xl"></i>
                        </div>
                      </div>
                          </>
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <i className="fas fa-video text-gray-400 text-2xl"></i>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">
                        {currentLanguage === 'ar' ? video.title_ar : video.title_en}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {currentLanguage === 'ar' 
                          ? (video.categories?.name_ar || video.category_name_ar || '') 
                          : (video.categories?.name_en || video.category_name_en || '')}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {video.duration_seconds ? `${Math.floor(video.duration_seconds / 60)}:${String(video.duration_seconds % 60).padStart(2, '0')}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {(traineeCurrentSection === 'favorites' ? totalFavoriteVideosPages : totalTraineeVideosPages) > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <button
                  onClick={() => {
                    if (traineeCurrentSection === 'favorites') {
                      setFavoriteVideosPage(prev => Math.max(1, prev - 1));
                    } else {
                      setTraineeVideosPage(prev => Math.max(1, prev - 1));
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={(traineeCurrentSection === 'favorites' ? favoriteVideosPage : traineeVideosPage) === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    (traineeCurrentSection === 'favorites' ? favoriteVideosPage : traineeVideosPage) === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                  }`}
                >
                  <i className={`fas fa-chevron-${isRTL ? 'right' : 'left'} ${isRTL ? 'ml-2' : 'mr-2'}`}></i>
                  {currentLanguage === 'ar' ? 'السابق' : 'Previous'}
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: traineeCurrentSection === 'favorites' ? totalFavoriteVideosPages : totalTraineeVideosPages }, (_, i) => i + 1)
                    .filter(page => {
                      const currentPage = traineeCurrentSection === 'favorites' ? favoriteVideosPage : traineeVideosPage;
                      const totalPages = traineeCurrentSection === 'favorites' ? totalFavoriteVideosPages : totalTraineeVideosPages;
                      // Show first page, last page, current page, and pages around current
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => {
                      const currentPage = traineeCurrentSection === 'favorites' ? favoriteVideosPage : traineeVideosPage;
                      const totalPages = traineeCurrentSection === 'favorites' ? totalFavoriteVideosPages : totalTraineeVideosPages;
                      
                      // Add ellipsis if there's a gap
                      const showEllipsisBefore = index > 0 && array[index - 1] < page - 1;
                      const showEllipsisAfter = index < array.length - 1 && array[index + 1] > page + 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsisBefore && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => {
                              if (traineeCurrentSection === 'favorites') {
                                setFavoriteVideosPage(page);
                              } else {
                                setTraineeVideosPage(page);
                              }
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              page === currentPage
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                          {showEllipsisAfter && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                </div>
                
                <button
                  onClick={() => {
                    if (traineeCurrentSection === 'favorites') {
                      setFavoriteVideosPage(prev => Math.min(totalFavoriteVideosPages, prev + 1));
                    } else {
                      setTraineeVideosPage(prev => Math.min(totalTraineeVideosPages, prev + 1));
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={(traineeCurrentSection === 'favorites' ? favoriteVideosPage : traineeVideosPage) === (traineeCurrentSection === 'favorites' ? totalFavoriteVideosPages : totalTraineeVideosPages)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    (traineeCurrentSection === 'favorites' ? favoriteVideosPage : traineeVideosPage) === (traineeCurrentSection === 'favorites' ? totalFavoriteVideosPages : totalTraineeVideosPages)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                  }`}
                >
                  {currentLanguage === 'ar' ? 'التالي' : 'Next'}
                  <i className={`fas fa-chevron-${isRTL ? 'left' : 'right'} ${isRTL ? 'mr-2' : 'ml-2'}`}></i>
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 text-center py-16 text-gray-500">
              {traineeCurrentSection === 'favorites' ? (
                currentLanguage === 'ar' 
                  ? 'لا توجد فيديوهات مفضلة'
                  : 'No favorite videos'
              ) : (
                debouncedTraineeVideoSearch || traineeVideoCategoryFilter !== 'all' 
                  ? (currentLanguage === 'ar' ? 'لا توجد فيديوهات تطابق الفلتر' : 'No videos match the filter')
                  : (currentLanguage === 'ar' ? 'لا توجد فيديوهات متاحة' : 'No videos available')
              )}
            </div>
          )}
          </div>
        </DashboardShell>

        <VideoPreviewModal
          isOpen={showVideoModal && !!previewVideo}
          onClose={closeVideoPreview}
          video={previewVideo}
          videoUrl={previewVideoUrl}
          loading={previewVideoLoading}
          error={previewVideoError}
          currentLanguage={currentLanguage}
          isRTL={isRTL}
        />
      </>
    );
  }

  return (
    <>
      <DashboardShell
        isRTL={isRTL}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        onSidebarClose={() => setSidebarOpen(false)}
        sidebarTitle={t('dashboard-title')}
        sidebarSubtitle={t('welcome-text')}
        navItems={coachNavItems}
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
        logoutLabel={t('logout-text')}
        loggingOutLabel={currentLanguage === 'ar' ? 'جاري تسجيل الخروج...' : 'Logging out...'}
        onToggleLanguage={toggleLanguage}
        languageToggleLabel={currentLanguage === 'en' ? 'العربية' : 'English'}
        pageTitle={getPageTitle()}
        userDisplayName={userData?.full_name || userData?.email || 'Coach'}
      >
          {/* Overview Section */}
          {currentSection === 'overview' && (
            <div className="section">
              {statsLoading ? (
                <StatsCardGrid count={8} />
              ) : (
                <>
              <SectionHeader
                title={getPageTitle()}
                subtitle={t('welcome-text')}
              />
              {/* Main Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                  label={t('total-trainees-label')}
                  value={stats.trainees}
                  icon="fa-users"
                  color="blue"
                  footer={viewAllLabel}
                  isRTL={isRTL}
                  onClick={() => setCurrentSection('trainees')}
                />
                <StatCard
                  label={t('total-videos-label')}
                  value={stats.videos}
                  icon="fa-video"
                  color="green"
                  footer={viewAllLabel}
                  isRTL={isRTL}
                  onClick={() => setCurrentSection('videos')}
                />
                <StatCard
                  label={t('total-packages-label')}
                  value={stats.packages}
                  icon="fa-box"
                  color="purple"
                  footer={viewAllLabel}
                  isRTL={isRTL}
                  onClick={() => setCurrentSection('packages')}
                />
                <StatCard
                  label={t('total-categories-label')}
                  value={stats.categories}
                  icon="fa-folder"
                  color="yellow"
                  footer={viewAllLabel}
                  isRTL={isRTL}
                  onClick={() => setCurrentSection('categories')}
                />
              </div>

              {/* Additional Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                  label={t('active-subscriptions-label')}
                  value={stats.activeSubscriptions}
                  icon="fa-user-check"
                  color="indigo"
                  footer={`${stats.totalSubscriptions} ${currentLanguage === 'ar' ? 'إجمالي' : 'total'}`}
                  isRTL={isRTL}
                  onClick={() => setCurrentSection('subscriptions')}
                />
                <StatCard
                  label={t('success-stories-label')}
                  value={stats.successStories}
                  icon="fa-star"
                  color="red"
                  footer={viewAllLabel}
                  isRTL={isRTL}
                  onClick={() => setCurrentSection('success-stories')}
                />
                <StatCard
                  label={t('reviews-label')}
                  value={stats.reviews}
                  icon="fa-comments"
                  color="orange"
                  footer={viewAllLabel}
                  isRTL={isRTL}
                  onClick={() => setCurrentSection('reviews')}
                />
                <StatCard
                  label={t('faqs-label')}
                  value={stats.faqs}
                  icon="fa-question-circle"
                  color="teal"
                  footer={viewAllLabel}
                  isRTL={isRTL}
                  onClick={() => setCurrentSection('faqs')}
                />
              </div>

              {/* Video Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{t('total-videos-label')}</h3>
                    <button
                      onClick={() => setCurrentSection('videos')}
                      className="text-sm text-[var(--color-primary)] hover:underline"
                    >
                      {t('view-all')}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">{t('public-videos-label')}</p>
                      <p className="text-2xl font-bold text-green-600">{stats.publicVideos}</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">{t('private-videos-label')}</p>
                      <p className="text-2xl font-bold text-red-600">{stats.privateVideos}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3">
                      <i className="fas fa-bolt text-white"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{t('quick-shortcuts-title')}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setEditingCategoryId(null);
                        setShowCategoryForm(true);
                      }}
                      className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-blue-200"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <i className="fas fa-folder-plus text-white text-lg"></i>
                      </div>
                      <span className="text-sm font-semibold text-blue-700">{t('add-category-text')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingVideoId(null);
                        setShowVideoForm(true);
                      }}
                      className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-green-200"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <i className="fas fa-video text-white text-lg"></i>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{t('add-video-text')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingPackageId(null);
                        setShowPackageForm(true);
                      }}
                      className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-purple-200"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <i className="fas fa-box text-white text-lg"></i>
                      </div>
                      <span className="text-sm font-semibold text-purple-700">{currentLanguage === 'ar' ? 'إضافة باقة' : 'Add Package'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingStoryId(null);
                        setShowStoryForm(true);
                      }}
                      className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-pink-200"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <i className="fas fa-star text-white text-lg"></i>
                      </div>
                      <span className="text-sm font-semibold text-pink-700">{currentLanguage === 'ar' ? 'إضافة قصة نجاح' : 'Add Story'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3">
                        <i className="fas fa-clock text-white"></i>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">{t('recent-activity-title')}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {recentActivitiesLoading ? (
                    <ListSkeleton count={5} />
                  ) : recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivities.map((activity) => {
                        const colorClasses = {
                          blue: 'from-blue-400 to-blue-600 bg-blue-50 border-blue-200 text-blue-700',
                          green: 'from-green-400 to-green-600 bg-green-50 border-green-200 text-green-700',
                          purple: 'from-purple-400 to-purple-600 bg-purple-50 border-purple-200 text-purple-700',
                          indigo: 'from-indigo-400 to-indigo-600 bg-indigo-50 border-indigo-200 text-indigo-700',
                          pink: 'from-pink-400 to-pink-600 bg-pink-50 border-pink-200 text-pink-700',
                          orange: 'from-orange-400 to-orange-600 bg-orange-50 border-orange-200 text-orange-700',
                          teal: 'from-teal-400 to-teal-600 bg-teal-50 border-teal-200 text-teal-700'
                        };
                        const colorClass = colorClasses[activity.color] || colorClasses.blue;
                        
                        return (
                          <div key={activity.id} className="flex items-start p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} flex items-center justify-center shadow-md flex-shrink-0 ${isRTL ? 'ml-4' : 'mr-4'}`}>
                              <i className={`fas fa-${activity.icon} text-white text-lg`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className={`font-semibold text-gray-800 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {activity.title}
                                  </p>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <i className={`fas fa-${activity.icon} ${isRTL ? 'ml-2' : 'mr-2'}`}></i>
                                    <span className="capitalize">
                                      {currentLanguage === 'ar' 
                                        ? (activity.type === 'category' ? 'تصنيف' : 
                                           activity.type === 'video' ? 'فيديو' : 
                                           activity.type === 'package' ? 'باقة' : 
                                           activity.type === 'subscription' ? 'اشتراك' : 
                                           activity.type === 'story' ? 'قصة نجاح' : activity.type)
                                        : activity.type
                                      }
                                    </span>
                                  </div>
                                </div>
                                <div className={`text-xs text-gray-500 ${isRTL ? 'mr-4' : 'ml-4'} flex-shrink-0`}>
                                  <i className="far fa-clock mr-1"></i>
                                  {getTimeAgo(activity.time)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-inbox text-gray-400 text-3xl"></i>
                      </div>
                      <p className="text-gray-500 text-lg font-medium">{t('no-activity')}</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {currentLanguage === 'ar' 
                          ? 'سيظهر النشاط الأخير هنا عند إضافة محتوى جديد'
                          : 'Recent activity will appear here when you add new content'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
                </>
              )}
            </div>
          )}

          {/* Categories Section */}
          {currentSection === 'categories' && (
            <div className="section">
              <SectionHeader
                title={t('categories-title')}
                actions={
                  <Button
                    variant="primary"
                    leftIcon={<i className="fas fa-plus" aria-hidden="true" />}
                    onClick={() => {
                      setEditingCategoryId(null);
                      setShowCategoryForm(true);
                    }}
                  >
                    {t('add-category-text')}
                  </Button>
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                <Input
                  className="md:col-span-2 lg:col-span-2"
                  type="text"
                  value={categorySearch}
                  onChange={(event) => setCategorySearch(event.target.value)}
                  placeholder={currentLanguage === 'ar' ? 'ابحث عن تصنيف...' : 'Search categories...'}
                  isRTL={isRTL}
                />
                <Select
                  value={categoryStatusFilter}
                  onChange={(event) => setCategoryStatusFilter(event.target.value)}
                  options={[
                    { value: 'all', label: currentLanguage === 'ar' ? 'كل الحالات' : 'All statuses' },
                    { value: 'public', label: currentLanguage === 'ar' ? 'عام' : 'Public' },
                    { value: 'private', label: currentLanguage === 'ar' ? 'خاص' : 'Private' },
                  ]}
                />
              </div>

              {categoriesLoading ? (
                <TableSkeleton rows={5} columns={4} />
              ) : (
                <Table
                  isRTL={isRTL}
                  data={filteredCategories}
                  emptyState={
                    <EmptyState
                      title={currentLanguage === 'ar' ? 'لا توجد تصنيفات' : 'No categories'}
                      description={currentLanguage === 'ar' ? 'لا توجد تصنيفات مطابقة للفلتر' : 'No categories match your filters'}
                    />
                  }
                  columns={[
                    {
                      key: 'name',
                      header: t('th-category-name'),
                      render: (category) => (
                        <p className="font-semibold text-center">
                          {currentLanguage === 'ar' ? (category.name_ar || category.title_ar) : (category.name_en || category.title_en)}
                        </p>
                      ),
                    },
                    {
                      key: 'description',
                      header: currentLanguage === 'ar' ? 'الوصف' : 'Description',
                      render: (category) => (
                        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 max-w-[260px] mx-auto text-center">
                          {currentLanguage === 'ar' ? category.description_ar : category.description_en}
                        </p>
                      ),
                    },
                    {
                      key: 'public',
                      header: t('th-public'),
                      render: (category) => (
                        <div className="text-center">
                          <Badge variant={category.is_public ? 'success' : 'danger'}>
                            {category.is_public ? (currentLanguage === 'ar' ? 'نعم' : 'Yes') : (currentLanguage === 'ar' ? 'لا' : 'No')}
                          </Badge>
                        </div>
                      ),
                    },
                    {
                      key: 'actions',
                      header: t('th-actions'),
                      render: (category) => (
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCategoryId(category.id);
                              setShowCategoryForm(true);
                            }}
                            aria-label="Edit"
                          >
                            <i className="fas fa-edit text-[var(--color-primary)]" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            aria-label="Delete"
                          >
                            <i className="fas fa-trash text-[var(--color-danger)]" aria-hidden="true" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          )}

          {/* Videos Section */}
          {currentSection === 'videos' && (
            <div className="section">
              <SectionHeader
                title={t('videos-title')}
                actions={
                  <Button
                    variant="primary"
                    leftIcon={<i className="fas fa-plus" aria-hidden="true" />}
                    onClick={() => {
                      setEditingVideoId(null);
                      setShowVideoForm(true);
                    }}
                  >
                    {t('add-video-text')}
                  </Button>
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                <Input
                  className="md:col-span-2 lg:col-span-2"
                  type="text"
                  value={videoSearch}
                  onChange={(event) => setVideoSearch(event.target.value)}
                  placeholder={currentLanguage === 'ar' ? 'ابحث عن فيديو...' : 'Search videos...'}
                  isRTL={isRTL}
                />
                <Select
                  value={videoCategoryFilter}
                  onChange={(event) => setVideoCategoryFilter(event.target.value)}
                  options={[
                    { value: 'all', label: currentLanguage === 'ar' ? 'كل الفئات' : 'All categories' },
                    ...categories.map((category) => ({
                      value: category.id,
                      label: currentLanguage === 'ar' ? category.name_ar : category.name_en,
                    })),
                  ]}
                />
                <Select
                  value={videoStatusFilter}
                  onChange={(event) => setVideoStatusFilter(event.target.value)}
                  options={[
                    { value: 'all', label: currentLanguage === 'ar' ? 'كل الحالات' : 'All statuses' },
                    { value: 'public', label: currentLanguage === 'ar' ? 'عام' : 'Public' },
                    { value: 'private', label: currentLanguage === 'ar' ? 'خاص' : 'Private' },
                  ]}
                />
              </div>

              {videosLoading ? (
                <TableSkeleton rows={5} columns={5} />
              ) : (
                <Table
                  isRTL={isRTL}
                  data={paginatedVideos}
                  emptyState={
                    <EmptyState
                      title={currentLanguage === 'ar' ? 'لا توجد فيديوهات' : 'No videos'}
                      description={currentLanguage === 'ar' ? 'لا توجد فيديوهات مطابقة للفلتر' : 'No videos match your filters'}
                    />
                  }
                  columns={[
                    {
                      key: 'title',
                      header: t('th-video-title'),
                      render: (video) => (
                        <div className="flex flex-col items-center gap-2">
                          <button type="button" onClick={() => handlePreviewVideo(video)} className="relative group">
                            <div className="w-20 h-12 rounded-lg overflow-hidden shadow border border-[var(--color-border)]">
                              {resolveVideoAsset(video, 'thumbnail') ? (
                                <OptimizedImage
                                  src={resolveVideoAsset(video, 'thumbnail')}
                                  alt={currentLanguage === 'ar' ? video.title_ar : video.title_en}
                                  className="w-full h-full object-cover"
                                  width={80}
                                  height={48}
                                  loading="lazy"
                                  priority={false}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] text-sm">
                                  <i className="fas fa-play" aria-hidden="true" />
                                </div>
                              )}
                            </div>
                            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs opacity-0 group-hover:opacity-100 transition">
                              {currentLanguage === 'ar' ? 'عرض الفيديو' : 'Preview video'}
                            </span>
                          </button>
                          <div className="space-y-1 text-center">
                            <p className="font-semibold text-[var(--color-text)] truncate max-w-[180px]">
                              {currentLanguage === 'ar' ? (video.title_ar || video.name_ar) : (video.title_en || video.name_en)}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 max-w-[220px]">
                              {currentLanguage === 'ar' ? video.description_ar : video.description_en}
                            </p>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'category',
                      header: t('th-category'),
                      render: (video) => (
                        <div className="text-center">{getCategoryLabel(video.category_id)}</div>
                      ),
                    },
                    {
                      key: 'duration',
                      header: currentLanguage === 'ar' ? 'المدة' : 'Duration',
                      render: (video) => (
                        <div className="text-center">{formatDurationSeconds(video.duration_seconds)}</div>
                      ),
                    },
                    {
                      key: 'public',
                      header: t('th-public'),
                      render: (video) => (
                        <div className="text-center">
                          <Badge variant={video.is_public ? 'success' : 'danger'}>
                            {video.is_public ? (currentLanguage === 'ar' ? 'نعم' : 'Yes') : (currentLanguage === 'ar' ? 'لا' : 'No')}
                          </Badge>
                        </div>
                      ),
                    },
                    {
                      key: 'actions',
                      header: t('th-actions'),
                      render: (video) => (
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingVideoId(video.id);
                              setShowVideoForm(true);
                            }}
                            aria-label="Edit"
                          >
                            <i className="fas fa-edit text-[var(--color-primary)]" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveVideo(video);
                              setShowVideoAccessModal(true);
                            }}
                            aria-label="Access"
                          >
                            <i className="fas fa-user-lock text-green-600" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVideo(video.id)}
                            aria-label="Delete"
                          >
                            <i className="fas fa-trash text-[var(--color-danger)]" aria-hidden="true" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              )}

              {filteredVideos.length > 0 && (
                <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
                  <p className="text-sm text-gray-500">
                    {currentLanguage === 'ar'
                      ? filteredVideos.length
                        ? `عرض ${videoStartIndex}-${videoEndIndex} من إجمالي ${filteredVideos.length} فيديو`
                        : 'لا توجد فيديوهات مطابقة'
                      : filteredVideos.length
                        ? `Showing ${videoStartIndex}-${videoEndIndex} of ${filteredVideos.length} videos`
                        : 'No videos match your filters'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setVideoPage((prev) => Math.max(1, prev - 1))}
                      disabled={videoPage === 1}
                      className={`px-3 py-1 rounded-lg border ${videoPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      {currentLanguage === 'ar' ? 'السابق' : 'Prev'}
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentLanguage === 'ar'
                        ? `الصفحة ${videoPage} من ${totalVideoPages}`
                        : `Page ${videoPage} of ${totalVideoPages}`}
                    </span>
                    <button
                      onClick={() => setVideoPage((prev) => Math.min(totalVideoPages, prev + 1))}
                      disabled={videoPage >= totalVideoPages}
                      className={`px-3 py-1 rounded-lg border ${videoPage >= totalVideoPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      {currentLanguage === 'ar' ? 'التالي' : 'Next'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subscriptions Section */}
          {currentSection === 'subscriptions' && (
            <div className="section">
              <SectionHeader
                title={currentLanguage === 'ar' ? 'إدارة الاشتراكات' : 'Subscriptions Management'}
                actions={
                  <Button
                    variant="secondary"
                    leftIcon={<i className="fas fa-sync-alt" aria-hidden="true" />}
                    onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions() })}
                  >
                    {currentLanguage === 'ar' ? 'تحديث' : 'Refresh'}
                  </Button>
                }
              />

              {subscriptionsLoading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : (
                <Table
                  isRTL={isRTL}
                  data={subscriptions}
                  emptyState={
                    <EmptyState
                      title={currentLanguage === 'ar' ? 'لا توجد اشتراكات' : 'No subscriptions'}
                      description={currentLanguage === 'ar' ? 'لا توجد اشتراكات مسجلة' : 'No subscriptions found'}
                    />
                  }
                  columns={[
                    {
                      key: 'trainee',
                      header: currentLanguage === 'ar' ? 'المتدرب' : 'Trainee',
                      render: (sub) => sub.users?.full_name || sub.users?.email || 'N/A',
                    },
                    {
                      key: 'package',
                      header: currentLanguage === 'ar' ? 'الباقة' : 'Package',
                      render: (sub) =>
                        currentLanguage === 'ar'
                          ? sub.packages?.name_ar || sub.packages?.name_en
                          : sub.packages?.name_en || sub.packages?.name_ar,
                    },
                    {
                      key: 'status',
                      header: currentLanguage === 'ar' ? 'الحالة' : 'Status',
                      render: (sub) => {
                        const variant =
                          sub.status === 'active'
                            ? 'success'
                            : sub.status === 'paused'
                              ? 'warning'
                              : sub.status === 'cancelled'
                                ? 'danger'
                                : 'neutral';
                        return <Badge variant={variant}>{sub.status || 'N/A'}</Badge>;
                      },
                    },
                    {
                      key: 'start_date',
                      header: currentLanguage === 'ar' ? 'تاريخ البداية' : 'Start Date',
                      render: (sub) => (
                        <span className="text-sm text-[var(--color-text-muted)]">
                          {sub.start_date ? new Date(sub.start_date).toLocaleDateString() : 'N/A'}
                        </span>
                      ),
                    },
                    {
                      key: 'end_date',
                      header: currentLanguage === 'ar' ? 'تاريخ النهاية' : 'End Date',
                      render: (sub) => (
                        <span className="text-sm text-[var(--color-text-muted)]">
                          {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'N/A'}
                        </span>
                      ),
                    },
                    {
                      key: 'actions',
                      header: currentLanguage === 'ar' ? 'الإجراءات' : 'Actions',
                      render: (sub) => (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleManageSubscription(sub.id, sub.status)}>
                            <i className="fas fa-sliders-h text-[var(--color-primary)] me-1" aria-hidden="true" />
                            {currentLanguage === 'ar' ? 'إدارة' : 'Manage'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveTrainee({
                                id: sub.user_id,
                                full_name: sub.users?.full_name,
                                email: sub.users?.email,
                              });
                              setShowTraineeAccessModal(true);
                            }}
                          >
                            <i className="fas fa-key text-green-600 me-1" aria-hidden="true" />
                            {currentLanguage === 'ar' ? 'الصلاحيات' : 'Access'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSubscription(sub.id)}
                            aria-label={currentLanguage === 'ar' ? 'حذف الاشتراك' : 'Delete Subscription'}
                          >
                            <i className="fas fa-trash text-[var(--color-danger)]" aria-hidden="true" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          )}

          {/* Packages Section */}
          {currentSection === 'packages' && (
            <div className="section">
              <SectionHeader
                title={currentLanguage === 'ar' ? 'إدارة الباقات' : 'Packages Management'}
                actions={
                  <Button
                    variant="primary"
                    leftIcon={<i className="fas fa-plus" aria-hidden="true" />}
                    onClick={() => {
                      setEditingPackageId(null);
                      setShowPackageForm(true);
                    }}
                  >
                    {currentLanguage === 'ar' ? 'إضافة باقة' : 'Add Package'}
                  </Button>
                }
              />

              <div className="mb-6">
                <Input
                  type="text"
                  value={packageSearch}
                  onChange={(event) => setPackageSearch(event.target.value)}
                  placeholder={currentLanguage === 'ar' ? 'ابحث عن باقة...' : 'Search packages...'}
                  isRTL={isRTL}
                />
              </div>

              {packagesLoading ? (
                <TableSkeleton rows={5} columns={7} />
              ) : (
                <Table
                  isRTL={isRTL}
                  data={filteredPackages}
                  emptyState={
                    <EmptyState
                      title={currentLanguage === 'ar' ? 'لا توجد باقات' : 'No packages'}
                      description={currentLanguage === 'ar' ? 'لا توجد باقات مطابقة لبحثك' : 'No packages match your search'}
                    />
                  }
                  columns={[
                    {
                      key: 'name',
                      header: t('th-name'),
                      render: (pkg) => {
                        const features = currentLanguage === 'ar' ? pkg.features_ar : pkg.features_en;
                        return (
                          <div className="space-y-2 text-center">
                            <p className="font-semibold text-[var(--color-text)] truncate max-w-[160px] mx-auto">
                              {currentLanguage === 'ar' ? pkg.name_ar : pkg.name_en}
                            </p>
                            <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 max-w-[200px] mx-auto">
                              {currentLanguage === 'ar' ? pkg.description_ar : pkg.description_en}
                            </p>
                            {features?.length ? (
                              <div className="flex flex-wrap gap-2 justify-center">
                                {features.slice(0, 3).map((feature, index) => (
                                  <Badge key={index} variant="info">{feature}</Badge>
                                ))}
                                {features.length > 3 && (
                                  <Badge variant="neutral">+{features.length - 3}</Badge>
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      },
                    },
                    {
                      key: 'price_egp',
                      header: currentLanguage === 'ar' ? 'السعر (جنيه)' : 'Price (EGP)',
                      render: (pkg) => (
                        <div className="text-center">
                          {typeof pkg.price_egp === 'number'
                            ? pkg.price_egp.toLocaleString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US')
                            : currentLanguage === 'ar' ? 'غير متاح' : 'N/A'}
                        </div>
                      ),
                    },
                    {
                      key: 'price_usd',
                      header: currentLanguage === 'ar' ? 'السعر (دولار)' : 'Price (USD)',
                      render: (pkg) => (
                        <div className="text-center">
                          {typeof pkg.price_usd === 'number'
                            ? pkg.price_usd.toLocaleString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US')
                            : currentLanguage === 'ar' ? 'غير متاح' : 'N/A'}
                        </div>
                      ),
                    },
                    {
                      key: 'duration',
                      header: currentLanguage === 'ar' ? 'المدة' : 'Duration',
                      render: (pkg) => (
                        <div className="text-center">
                          {pkg.duration_days} {currentLanguage === 'ar' ? 'يوم' : 'days'}
                        </div>
                      ),
                    },
                    {
                      key: 'level',
                      header: currentLanguage === 'ar' ? 'المستوى' : 'Level',
                      render: (pkg) => (
                        <div className="text-center">
                          <Badge variant="info">{pkg.level || 'N/A'}</Badge>
                        </div>
                      ),
                    },
                    {
                      key: 'type',
                      header: currentLanguage === 'ar' ? 'النوع / المزايا' : 'Type / Benefits',
                      render: (pkg) => (
                        <div className="flex flex-col gap-1 items-center">
                          <Badge variant="primary">{pkg.type}</Badge>
                          <div className="flex flex-wrap gap-2 justify-center">
                            <Badge variant={pkg.includes_video_feedback ? 'success' : 'neutral'}>
                              {pkg.includes_video_feedback
                                ? (currentLanguage === 'ar' ? 'يشمل تغذية بالفيديو' : 'Video feedback included')
                                : (currentLanguage === 'ar' ? 'بدون تغذية بالفيديو' : 'No video feedback')}
                            </Badge>
                            <Badge variant={pkg.daily_support ? 'success' : 'neutral'}>
                              {pkg.daily_support
                                ? (currentLanguage === 'ar' ? 'دعم يومي' : 'Daily support')
                                : (currentLanguage === 'ar' ? 'لا يوجد دعم يومي' : 'No daily support')}
                            </Badge>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: 'actions',
                      header: currentLanguage === 'ar' ? 'الإجراءات' : 'Actions',
                      render: (pkg) => (
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPackageId(pkg.id);
                              setShowPackageForm(true);
                            }}
                            aria-label="Edit"
                          >
                            <i className="fas fa-edit text-[var(--color-primary)]" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePackage(pkg.id)}
                            aria-label="Delete"
                          >
                            <i className="fas fa-trash text-[var(--color-danger)]" aria-hidden="true" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          )}

          {/* Trainees Section */}
          {currentSection === 'trainees' && (
            <div className="section">
              <SectionHeader title={currentLanguage === 'ar' ? 'إدارة المتدربين' : 'Trainees Management'} />

              {traineesLoading ? (
                <TableSkeleton rows={5} columns={5} />
              ) : (
                <Table
                  isRTL={isRTL}
                  data={trainees}
                  emptyState={
                    <EmptyState
                      title={currentLanguage === 'ar' ? 'لا يوجد متدربون' : 'No trainees'}
                      description={currentLanguage === 'ar' ? 'لا يوجد متدربون مسجلون' : 'No trainees registered yet'}
                    />
                  }
                  columns={[
                    {
                      key: 'name',
                      header: currentLanguage === 'ar' ? 'الاسم' : 'Name',
                      render: (trainee) => trainee.full_name || 'N/A',
                    },
                    {
                      key: 'email',
                      header: currentLanguage === 'ar' ? 'البريد الإلكتروني' : 'Email',
                      render: (trainee) => trainee.email,
                    },
                    {
                      key: 'phone',
                      header: currentLanguage === 'ar' ? 'الهاتف' : 'Phone',
                      render: (trainee) => trainee.phone || 'N/A',
                    },
                    {
                      key: 'joined',
                      header: currentLanguage === 'ar' ? 'تاريخ الانضمام' : 'Joined',
                      render: (trainee) => (
                        <span className="text-sm text-[var(--color-text-muted)]">
                          {trainee.created_at ? new Date(trainee.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      ),
                    },
                    {
                      key: 'actions',
                      header: currentLanguage === 'ar' ? 'الإجراءات' : 'Actions',
                      render: (trainee) => (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveTrainee(trainee);
                              setShowTraineeAccessModal(true);
                            }}
                          >
                            <i className="fas fa-key text-green-600 me-1" aria-hidden="true" />
                            {currentLanguage === 'ar' ? 'الصلاحيات' : 'Access'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setTraineeForConversion(trainee);
                              setShowConvertToSubscriptionModal(true);
                            }}
                          >
                            <i className="fas fa-shopping-cart text-[var(--color-primary)] me-1" aria-hidden="true" />
                            {currentLanguage === 'ar' ? 'تحويل إلى اشتراك' : 'Convert to Subscription'}
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          )}

          {/* Success Stories Section */}
          {currentSection === 'success-stories' && (
            <div className="section">
              <SectionHeader
                title={currentLanguage === 'ar' ? 'إدارة قصص النجاح' : 'Success Stories Management'}
                actions={
                  <Button
                    variant="primary"
                    leftIcon={<i className="fas fa-plus" aria-hidden="true" />}
                    onClick={() => {
                      setEditingStoryId(null);
                      setShowStoryForm(true);
                    }}
                  >
                    {currentLanguage === 'ar' ? 'إضافة قصة' : 'Add Story'}
                  </Button>
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                <Input
                  className="md:col-span-2 lg:col-span-2"
                  type="text"
                  value={storySearch}
                  onChange={(event) => setStorySearch(event.target.value)}
                  placeholder={currentLanguage === 'ar' ? 'ابحث عن قصة...' : 'Search stories...'}
                  isRTL={isRTL}
                />
                <Select
                  value={storyStatusFilter}
                  onChange={(event) => setStoryStatusFilter(event.target.value)}
                  options={[
                    { value: 'all', label: currentLanguage === 'ar' ? 'كل الحالات' : 'All statuses' },
                    { value: 'public', label: currentLanguage === 'ar' ? 'عام' : 'Public' },
                    { value: 'private', label: currentLanguage === 'ar' ? 'خاص' : 'Private' },
                  ]}
                />
                <Select
                  value={storyFeaturedFilter}
                  onChange={(event) => setStoryFeaturedFilter(event.target.value)}
                  options={[
                    { value: 'all', label: currentLanguage === 'ar' ? 'كل الأنواع' : 'All types' },
                    { value: 'featured', label: currentLanguage === 'ar' ? 'قصص مميزة' : 'Featured' },
                    { value: 'regular', label: currentLanguage === 'ar' ? 'قصص عادية' : 'Regular' },
                  ]}
                />
              </div>

              {successStoriesLoading ? (
                <TableSkeleton rows={5} columns={6} />
              ) : (
                <Table
                  isRTL={isRTL}
                  data={filteredSuccessStories}
                  emptyState={
                    <EmptyState
                      title={currentLanguage === 'ar' ? 'لا توجد قصص' : 'No stories'}
                      description={currentLanguage === 'ar' ? 'لا توجد قصص مطابقة للمرشحات الحالية' : 'No stories match the current filters'}
                    />
                  }
                  columns={[
                    {
                      key: 'story',
                      header: currentLanguage === 'ar' ? 'القصة' : 'Story',
                      render: (story) => (
                        <div className="space-y-1">
                          <p className="font-semibold text-[var(--color-text)]">
                            {currentLanguage === 'ar' ? (story.title_ar || story.title_en) : (story.title_en || story.title_ar)}
                          </p>
                          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                            {currentLanguage === 'ar' ? story.content_ar : story.content_en}
                          </p>
                        </div>
                      ),
                    },
                    {
                      key: 'images',
                      header: currentLanguage === 'ar' ? 'الصور' : 'Images',
                      render: (story) => (
                        <div className="flex items-center justify-center gap-4">
                          {['before', 'after'].map((type) => (
                            <div key={type} className="text-center">
                              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                                {type === 'before'
                                  ? (currentLanguage === 'ar' ? 'قبل' : 'Before')
                                  : (currentLanguage === 'ar' ? 'بعد' : 'After')}
                              </p>
                              {resolveSuccessStoryImage(story, type) ? (
                                <img
                                  src={resolveSuccessStoryImage(story, type)}
                                  alt={type}
                                  className="w-16 h-16 object-cover rounded-lg border border-[var(--color-border)]"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                                  {currentLanguage === 'ar' ? 'لا يوجد' : 'None'}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ),
                    },
                    {
                      key: 'status',
                      header: currentLanguage === 'ar' ? 'الحالة' : 'Status',
                      render: (story) => (
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Badge variant={story.is_public ? 'success' : 'danger'}>
                            {story.is_public ? (currentLanguage === 'ar' ? 'عام' : 'Public') : (currentLanguage === 'ar' ? 'خاص' : 'Private')}
                          </Badge>
                          <Badge variant={story.is_featured ? 'warning' : 'neutral'}>
                            {story.is_featured ? (currentLanguage === 'ar' ? 'مميز' : 'Featured') : (currentLanguage === 'ar' ? 'عادي' : 'Regular')}
                          </Badge>
                        </div>
                      ),
                    },
                    {
                      key: 'published',
                      header: currentLanguage === 'ar' ? 'تاريخ النشر' : 'Published',
                      render: (story) => (
                        <span className="text-sm text-[var(--color-text-muted)]">
                          {formatDateTime(story.published_at || story.created_at)}
                        </span>
                      ),
                    },
                    {
                      key: 'order',
                      header: currentLanguage === 'ar' ? 'الترتيب' : 'Order',
                      render: (story) => story.display_order ?? 0,
                    },
                    {
                      key: 'actions',
                      header: currentLanguage === 'ar' ? 'الإجراءات' : 'Actions',
                      render: (story) => (
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingStoryId(story.id);
                              setShowStoryForm(true);
                            }}
                            aria-label="Edit"
                          >
                            <i className="fas fa-edit text-[var(--color-primary)]" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStory(story.id)}
                            aria-label="Delete"
                          >
                            <i className="fas fa-trash text-[var(--color-danger)]" aria-hidden="true" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          )}

          {/* FAQs Section */}
          {currentSection === 'faqs' && (
            <div className="section">
              <SectionHeader
                title={currentLanguage === 'ar' ? 'إدارة الأسئلة الشائعة' : 'FAQs Management'}
                actions={
                  <Button
                    variant="primary"
                    leftIcon={<i className="fas fa-plus" aria-hidden="true" />}
                    onClick={() => {
                      setEditingFaqId(null);
                      setShowFaqForm(true);
                    }}
                  >
                    {currentLanguage === 'ar' ? 'إضافة سؤال' : 'Add FAQ'}
                  </Button>
                }
              />

              {faqsLoading ? (
                <TableSkeleton rows={5} columns={5} />
              ) : (
                <Table
                  isRTL={isRTL}
                  data={faqs}
                  emptyState={
                    <EmptyState
                      title={currentLanguage === 'ar' ? 'لا توجد أسئلة' : 'No FAQs'}
                      description={currentLanguage === 'ar' ? 'لا توجد أسئلة شائعة مسجلة' : 'No FAQs added yet'}
                    />
                  }
                  columns={[
                    {
                      key: 'question',
                      header: currentLanguage === 'ar' ? 'السؤال' : 'Question',
                      render: (faq) => (currentLanguage === 'ar' ? faq.question_ar : faq.question_en),
                    },
                    {
                      key: 'answer',
                      header: currentLanguage === 'ar' ? 'معاينة الإجابة' : 'Answer Preview',
                      render: (faq) => {
                        const answer = currentLanguage === 'ar' ? faq.answer_ar : faq.answer_en;
                        return answer ? `${answer.substring(0, 100)}...` : '—';
                      },
                    },
                    {
                      key: 'order',
                      header: currentLanguage === 'ar' ? 'الترتيب' : 'Order',
                      render: (faq) => faq.order_index || 0,
                    },
                    {
                      key: 'status',
                      header: currentLanguage === 'ar' ? 'الحالة' : 'Status',
                      render: (faq) => (
                        <Badge variant={faq.is_active ? 'success' : 'danger'}>
                          {faq.is_active
                            ? (currentLanguage === 'ar' ? 'نشط' : 'Active')
                            : (currentLanguage === 'ar' ? 'غير نشط' : 'Inactive')}
                        </Badge>
                      ),
                    },
                    {
                      key: 'actions',
                      header: t('th-actions'),
                      render: (faq) => (
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingFaqId(faq.id);
                              setShowFaqForm(true);
                            }}
                            aria-label="Edit"
                          >
                            <i className="fas fa-edit text-[var(--color-primary)]" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFaq(faq.id)}
                            aria-label="Delete"
                          >
                            <i className="fas fa-trash text-[var(--color-danger)]" aria-hidden="true" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          )}

          {/* Reviews Section */}
          {currentSection === 'reviews' && (
            <div className="section">
              <SectionHeader
                title={currentLanguage === 'ar' ? 'إدارة آراء العملاء' : 'Reviews Management'}
                actions={
                  <Button
                    variant="primary"
                    leftIcon={<i className="fas fa-plus" aria-hidden="true" />}
                    onClick={() => {
                      setEditingReviewId(null);
                      setShowReviewForm(true);
                    }}
                  >
                    {currentLanguage === 'ar' ? 'إضافة رأي' : 'Add Review'}
                  </Button>
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Input
                  className="md:col-span-2"
                  type="text"
                  value={reviewSearch}
                  onChange={(event) => setReviewSearch(event.target.value)}
                  placeholder={currentLanguage === 'ar' ? 'ابحث عن تقييم...' : 'Search reviews...'}
                  isRTL={isRTL}
                />
                <Select
                  value={reviewStatusFilter}
                  onChange={(event) => setReviewStatusFilter(event.target.value)}
                  options={[
                    { value: 'all', label: currentLanguage === 'ar' ? 'كل الحالات' : 'All statuses' },
                    { value: 'public', label: currentLanguage === 'ar' ? 'عام' : 'Public' },
                    { value: 'private', label: currentLanguage === 'ar' ? 'خاص' : 'Private' },
                  ]}
                />
              </div>

              {reviewsLoading ? (
                <TableSkeleton rows={5} columns={4} />
              ) : (
                <Table
                  isRTL={isRTL}
                  data={filteredReviews}
                  emptyState={
                    <EmptyState
                      title={currentLanguage === 'ar' ? 'لا توجد تقييمات' : 'No reviews'}
                      description={currentLanguage === 'ar' ? 'لا توجد تقييمات مطابقة' : 'No reviews match the filters'}
                    />
                  }
                  columns={[
                    {
                      key: 'image',
                      header: currentLanguage === 'ar' ? 'الصورة' : 'Image',
                      render: (review) => {
                        const imageUrl = review.image_url || (review.image_path ? cdnUrl('reviews', review.image_path) : null);
                        return (
                          <div className="text-center">
                            {imageUrl ? (
                              <img src={imageUrl} alt="Review" className="w-20 h-20 object-cover rounded mx-auto border border-[var(--color-border)]" />
                            ) : (
                              <span className="text-[var(--color-text-muted)]">{currentLanguage === 'ar' ? 'لا صورة' : 'No image'}</span>
                            )}
                          </div>
                        );
                      },
                    },
                    {
                      key: 'order',
                      header: currentLanguage === 'ar' ? 'الترتيب' : 'Order',
                      render: (review) => (
                        <div className="text-center">{review.display_order || 0}</div>
                      ),
                    },
                    {
                      key: 'status',
                      header: currentLanguage === 'ar' ? 'الحالة' : 'Status',
                      render: (review) => (
                        <div className="text-center">
                          <Badge variant={review.is_public ? 'success' : 'danger'}>
                            {review.is_public ? (currentLanguage === 'ar' ? 'عام' : 'Public') : (currentLanguage === 'ar' ? 'خاص' : 'Private')}
                          </Badge>
                        </div>
                      ),
                    },
                    {
                      key: 'actions',
                      header: t('th-actions'),
                      render: (review) => (
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingReviewId(review.id);
                              setShowReviewForm(true);
                            }}
                            aria-label="Edit"
                          >
                            <i className="fas fa-edit text-[var(--color-primary)]" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleReviewVisibility(review)}
                            aria-label={review.is_public ? (currentLanguage === 'ar' ? 'إخفاء التقييم' : 'Hide review') : (currentLanguage === 'ar' ? 'إظهار التقييم' : 'Show review')}
                          >
                            <i className={`fas ${review.is_public ? 'fa-eye-slash' : 'fa-eye'} text-amber-600`} aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            aria-label="Delete"
                          >
                            <i className="fas fa-trash text-[var(--color-danger)]" aria-hidden="true" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          )}
      </DashboardShell>

      <CategoryFormModal
        isOpen={showCategoryForm}
        onClose={() => {
          setShowCategoryForm(false);
          setEditingCategoryId(null);
        }}
        category={editingCategory}
        onSaved={() => invalidateContentCrud(queryClient, 'categories')}
        currentLanguage={currentLanguage}
      />

      <VideoFormModal
        isOpen={showVideoForm}
        onClose={() => {
          setShowVideoForm(false);
          setEditingVideoId(null);
        }}
        video={editingVideo}
        categories={categories}
        onSaved={() => invalidateContentCrud(queryClient, 'videos')}
        currentLanguage={currentLanguage}
      />

      <PackageFormModal
        isOpen={showPackageForm}
        onClose={() => {
          setShowPackageForm(false);
          setEditingPackageId(null);
        }}
        pack={editingPackage}
        onSaved={() => invalidateContentCrud(queryClient, 'packages')}
        currentLanguage={currentLanguage}
      />

      <SuccessStoryFormModal
        isOpen={showStoryForm}
        onClose={() => {
          setShowStoryForm(false);
          setEditingStoryId(null);
        }}
        story={editingStory}
        onSaved={() => invalidateContentCrud(queryClient, 'successStories')}
        currentLanguage={currentLanguage}
      />

      <FAQFormModal
        isOpen={showFaqForm}
        onClose={() => {
          setShowFaqForm(false);
          setEditingFaqId(null);
        }}
        faq={editingFaq}
        onSaved={() => invalidateContentCrud(queryClient, 'faqs')}
        currentLanguage={currentLanguage}
      />

      <ReviewFormModal
        isOpen={showReviewForm}
        onClose={() => {
          setShowReviewForm(false);
          setEditingReviewId(null);
        }}
        review={editingReview}
        onSaved={() => invalidateContentCrud(queryClient, 'reviews')}
        currentLanguage={currentLanguage}
      />

      <TraineeAccessModal
        isOpen={showTraineeAccessModal}
        onClose={() => {
          setShowTraineeAccessModal(false);
          setActiveTrainee(null);
        }}
        trainee={activeTrainee}
        categories={categories}
        videos={videos}
        onSaved={() => invalidateAccessCrud(queryClient)}
        currentLanguage={currentLanguage}
      />

      <VideoAccessModal
        isOpen={showVideoAccessModal}
        onClose={() => {
          setShowVideoAccessModal(false);
          setActiveVideo(null);
        }}
        video={activeVideo}
        trainees={trainees}
        onSaved={() => invalidateAccessCrud(queryClient)}
        currentLanguage={currentLanguage}
      />

      {/* Convert to Subscription Modal */}
      <Modal
        isOpen={Boolean(showConvertToSubscriptionModal && traineeForConversion)}
        onClose={() => {
          setShowConvertToSubscriptionModal(false);
          setTraineeForConversion(null);
        }}
        title={currentLanguage === 'ar' ? 'تحويل إلى اشتراك' : 'Convert to Subscription'}
        size="lg"
        footer={
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowConvertToSubscriptionModal(false);
                setTraineeForConversion(null);
              }}
            >
              {currentLanguage === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        }
      >
        {traineeForConversion && (
          <>
            <div className="mb-4 p-4 bg-[var(--color-bg-muted)] rounded-lg">
              <p className="text-sm text-[var(--color-text-muted)] mb-1">
                {currentLanguage === 'ar' ? 'المتدرب:' : 'Trainee:'}
              </p>
              <p className="font-semibold text-[var(--color-text)]">
                {traineeForConversion.full_name || traineeForConversion.email}
              </p>
            </div>
            <p className="text-sm font-medium text-[var(--color-text)] mb-3">
              {currentLanguage === 'ar' ? 'اختر الباقة:' : 'Select Package:'}
            </p>
            {packages.length === 0 ? (
              <EmptyState
                title={currentLanguage === 'ar' ? 'لا توجد باقات' : 'No packages available'}
              />
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handleConvertToSubscription(traineeForConversion.id, pkg.id)}
                    className="w-full text-start p-4 border-2 border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-muted)] transition-all"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-[var(--color-text)] mb-1">
                          {currentLanguage === 'ar' ? (pkg.name_ar || pkg.name_en) : (pkg.name_en || pkg.name_ar)}
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)] mb-2 line-clamp-2">
                          {currentLanguage === 'ar' ? (pkg.description_ar || pkg.description_en) : (pkg.description_en || pkg.description_ar)}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {pkg.price_egp && (
                            <span className="font-semibold text-[var(--color-text)]">
                              {pkg.price_egp} {currentLanguage === 'ar' ? 'ج.م' : 'EGP'}
                            </span>
                          )}
                          {pkg.price_usd && (
                            <span className="font-semibold text-[var(--color-text)]">${pkg.price_usd}</span>
                          )}
                          <span className="text-[var(--color-text-muted)]">
                            {pkg.duration_days} {currentLanguage === 'ar' ? 'يوم' : 'days'}
                          </span>
                        </div>
                      </div>
                      <i className={`fas fa-chevron-${isRTL ? 'left' : 'right'} text-[var(--color-text-muted)] mt-2 shrink-0`} aria-hidden="true" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>

      <VideoPreviewModal
        isOpen={showVideoModal && !!previewVideo}
        onClose={closeVideoPreview}
        video={previewVideo}
        videoUrl={previewVideoUrl}
        loading={previewVideoLoading}
        error={previewVideoError}
        currentLanguage={currentLanguage}
        isRTL={isRTL}
      />
    </>
  );

  // Helper functions
  async function handleDeleteCategory(id) {
    const confirmed = await showConfirm(
      currentLanguage === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?',
      currentLanguage === 'ar' ? 'سيتم حذف هذا التصنيف' : 'This category will be deleted',
      currentLanguage === 'ar' ? 'نعم، احذف' : 'Yes, delete it',
      currentLanguage === 'ar' ? 'إلغاء' : 'Cancel'
    );

    if (confirmed) {
      try {
        await contentService.deleteCategory(id);
        showSuccess(currentLanguage === 'ar' ? 'تم حذف التصنيف بنجاح' : 'Category has been deleted');
        invalidateContentCrud(queryClient, 'categories');
      } catch (error) {
        showError(error.message || 'Error deleting category');
      }
    }
  }

  async function handleDeleteVideo(id) {
    const confirmed = await showConfirm(
      currentLanguage === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?',
      currentLanguage === 'ar' ? 'سيتم حذف هذا الفيديو' : 'This video will be deleted',
      currentLanguage === 'ar' ? 'نعم، احذف' : 'Yes, delete it',
      currentLanguage === 'ar' ? 'إلغاء' : 'Cancel'
    );

    if (confirmed) {
      try {
        await contentService.deleteVideo(id);
        showSuccess(currentLanguage === 'ar' ? 'تم حذف الفيديو بنجاح' : 'Video has been deleted');
        invalidateContentCrud(queryClient, 'videos');
      } catch (error) {
        showError(error.message || 'Error deleting video');
      }
    }
  }

  async function handleManageSubscription(subscriptionId, newStatus) {
    try {
      await contentService.updateSubscription(subscriptionId, { status: newStatus });

      showSuccess(currentLanguage === 'ar' ? 'تم تحديث الحالة' : 'Status updated successfully');
      invalidateAccessCrud(queryClient);
    } catch (error) {
      showError(error.message || 'Error updating status');
    }
  }

  async function handleDeleteSubscription(id) {
    const confirmed = await showConfirm(
      currentLanguage === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?',
      currentLanguage === 'ar' ? 'سيتم حذف هذا الاشتراك' : 'This subscription will be deleted',
      currentLanguage === 'ar' ? 'نعم، احذف' : 'Yes, delete it',
      currentLanguage === 'ar' ? 'إلغاء' : 'Cancel'
    );

    if (confirmed) {
      try {
        await contentService.deleteSubscription(id);
        showSuccess(currentLanguage === 'ar' ? 'تم حذف الاشتراك بنجاح' : 'Subscription has been deleted');
        invalidateAccessCrud(queryClient);
      } catch (error) {
        showError(error.message || 'Error deleting subscription');
      }
    }
  }

  async function handleConvertToSubscription(traineeId, packageId) {
    try {
      const selectedPackage = packages.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        showError(currentLanguage === 'ar' ? 'الباقة غير موجودة' : 'Package not found');
        return;
      }

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + selectedPackage.duration_days);

      await contentService.createSubscription({
        userId: traineeId,
        packageId,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
      });

      showSuccess(currentLanguage === 'ar' ? 'تم تحويل المتدرب إلى اشتراك بنجاح' : 'Trainee converted to subscription successfully');
      setShowConvertToSubscriptionModal(false);
      setTraineeForConversion(null);
      invalidateAccessCrud(queryClient);
      
      // Switch to subscriptions section after conversion
      setTimeout(() => {
        setCurrentSection('subscriptions');
      }, 1000);
    } catch (error) {
      console.error('Error converting to subscription:', error);
      showError(error.message || (currentLanguage === 'ar' ? 'خطأ في تحويل المتدرب إلى اشتراك' : 'Error converting trainee to subscription'));
    }
  }

  async function handleToggleReviewVisibility(review) {
    try {
      await contentService.updateReview(review.id, { isPublic: !review.is_public });

      showSuccess(
        currentLanguage === 'ar'
          ? (!review.is_public ? 'تم إظهار التقييم' : 'تم إخفاء التقييم')
          : (!review.is_public ? 'Review is now public' : 'Review hidden successfully')
      );

      invalidateContentCrud(queryClient, 'reviews');
    } catch (error) {
      showError(error.message || 'Error updating review');
    }
  }

  async function handleDeletePackage(id) {
    const confirmed = await showConfirm(
      currentLanguage === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?',
      currentLanguage === 'ar' ? 'سيتم حذف هذه الباقة' : 'This package will be deleted',
      currentLanguage === 'ar' ? 'نعم، احذف' : 'Yes, delete it',
      currentLanguage === 'ar' ? 'إلغاء' : 'Cancel'
    );

    if (confirmed) {
      try {
        await contentService.deletePackage(id);
        showSuccess(currentLanguage === 'ar' ? 'تم حذف الباقة بنجاح' : 'Package has been deleted');
        invalidateContentCrud(queryClient, 'packages');
      } catch (error) {
        showError(error.message || 'Error deleting package');
      }
    }
  }

  async function handleDeleteStory(id) {
    const confirmed = await showConfirm(
      currentLanguage === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?',
      currentLanguage === 'ar' ? 'سيتم حذف هذه القصة' : 'This story will be deleted',
      currentLanguage === 'ar' ? 'نعم، احذف' : 'Yes, delete it',
      currentLanguage === 'ar' ? 'إلغاء' : 'Cancel'
    );

    if (confirmed) {
      try {
        await contentService.deleteSuccessStory(id);
        showSuccess(currentLanguage === 'ar' ? 'تم حذف القصة بنجاح' : 'Story has been deleted');
        invalidateContentCrud(queryClient, 'successStories');
      } catch (error) {
        showError(error.message || 'Error deleting story');
      }
    }
  }

  async function handleDeleteFaq(id) {
    const confirmed = await showConfirm(
      currentLanguage === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?',
      currentLanguage === 'ar' ? 'سيتم حذف هذا السؤال' : 'This FAQ will be deleted',
      currentLanguage === 'ar' ? 'نعم، احذف' : 'Yes, delete it',
      currentLanguage === 'ar' ? 'إلغاء' : 'Cancel'
    );

    if (confirmed) {
      try {
        await contentService.deleteFaq(id);
        showSuccess(currentLanguage === 'ar' ? 'تم حذف السؤال بنجاح' : 'FAQ has been deleted');
        invalidateContentCrud(queryClient, 'faqs');
      } catch (error) {
        showError(error.message || 'Error deleting FAQ');
      }
    }
  }

  async function handleDeleteReview(id) {
    const confirmed = await showConfirm(
      currentLanguage === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?',
      currentLanguage === 'ar' ? 'سيتم حذف هذا الرأي' : 'This review will be deleted',
      currentLanguage === 'ar' ? 'نعم، احذف' : 'Yes, delete it',
      currentLanguage === 'ar' ? 'إلغاء' : 'Cancel'
    );

    if (confirmed) {
      try {
        await contentService.deleteReview(id);
        showSuccess(currentLanguage === 'ar' ? 'تم حذف الرأي بنجاح' : 'Review has been deleted');
        invalidateContentCrud(queryClient, 'reviews');
      } catch (error) {
        showError(error.message || 'Error deleting review');
      }
    }
  }
};

export default Dashboard;


