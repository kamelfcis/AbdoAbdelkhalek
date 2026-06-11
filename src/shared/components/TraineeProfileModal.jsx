import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContentService } from '../lib/getContentService';
import { getTranslation } from '../../utils/translations';
import { getSquashTranslation } from '../i18n';
import { loginPath } from '../lib/authRoutes';

export default function TraineeProfileModal({
  isOpen,
  onClose,
  session,
  user,
  domain = 'fitness',
  onLogout,
  onError,
  currentLanguage = 'en',
}) {
  const navigate = useNavigate();
  const isRTL = currentLanguage === 'ar';
  const [profileDetails, setProfileDetails] = useState({
    loading: false,
    userData: null,
    videoCount: 0,
    categoryCount: 0,
    subscriptions: [],
    error: null,
  });

  const t = (key) =>
    domain === 'squash'
      ? getSquashTranslation(currentLanguage, `profile.${key}`)
      : getTranslation(`profile.${key}`, currentLanguage);

  useEffect(() => {
    let isMounted = true;

    const fetchProfileDetails = async () => {
      if (!session?.user || !isOpen) return;
      setProfileDetails((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const profile = await getContentService(domain).getProfileDetails();

        if (isMounted) {
          setProfileDetails({
            loading: false,
            userData: profile.userData || null,
            videoCount: profile.videoCount || 0,
            categoryCount: profile.categoryCount || 0,
            subscriptions: profile.subscriptions || [],
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setProfileDetails((prev) => ({
            ...prev,
            loading: false,
            error: error?.message || t('loadError'),
          }));
        }
        console.error('Error loading profile details:', error);
        onError?.(t('loadErrorToast'));
      }
    };

    if (isOpen) {
      fetchProfileDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, session, domain, currentLanguage]);

  const formatDate = (date) => {
    if (!date) return t('na');
    return new Date(date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US');
  };

  const handleLogout = async () => {
    try {
      if (onLogout) await onLogout();
    } finally {
      onClose?.();
      navigate(loginPath(domain), { replace: true, state: { logoutSuccess: true } });
    }
  };

  if (!session || !isOpen) {
    return null;
  }

  const activeSubscriptionCount = profileDetails.subscriptions.filter(
    (sub) => sub.status === 'active' && new Date(sub.end_date) > new Date()
  ).length;

  return (
    <div
      className="modal fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="modal-content bg-white rounded-lg overflow-hidden max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold gradient-text">{t('title')}</h3>
          <button
            className="text-gray-600 hover:text-[var(--color-primary)] text-2xl"
            onClick={onClose}
            aria-label={t('close')}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-6 space-y-6">
          {profileDetails.loading ? (
            <div className="text-center py-10">
              <div className="inline-block rounded-full h-10 w-10 border-4 border-gray-200 border-t-[var(--color-primary)] animate-spin mb-4"></div>
              <p className="text-gray-600">{t('loading')}</p>
            </div>
          ) : profileDetails.error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded">
              {profileDetails.error}
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user text-white text-2xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {profileDetails.userData?.full_name || user?.full_name || session?.user?.email}
                </h2>
                <p className="text-gray-600">{profileDetails.userData?.email || session?.user?.email}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    <i className={`fas fa-info-circle ${isRTL ? 'ml-2' : 'mr-2'} text-[var(--color-primary)]`}></i>
                    {t('personalInfo')}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      <span className="font-medium">{t('fullName')}</span>{' '}
                      {profileDetails.userData?.full_name || t('na')}
                    </li>
                    <li>
                      <span className="font-medium">{t('phone')}</span>{' '}
                      {profileDetails.userData?.phone || t('na')}
                    </li>
                    <li>
                      <span className="font-medium">{t('joined')}</span>{' '}
                      {formatDate(profileDetails.userData?.created_at)}
                    </li>
                    <li>
                      <span className="font-medium">{t('accountType')}</span>{' '}
                      {profileDetails.userData?.is_coach ? t('coach') : t('trainee')}
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    <i className={`fas fa-video ${isRTL ? 'ml-2' : 'mr-2'} text-[var(--color-primary)]`}></i>
                    {t('videoAccess')}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">{t('individualVideos')}</span>{' '}
                      {profileDetails.videoCount}
                    </p>
                    <p>
                      <span className="font-medium">{t('categoryAccess')}</span>{' '}
                      {profileDetails.categoryCount}
                    </p>
                    <p>
                      <span className="font-medium">{t('activeSubscriptionsCount')}</span>{' '}
                      {activeSubscriptionCount}
                    </p>
                    <p className="text-xs text-gray-500">{t('contactCoachHint')}</p>
                  </div>
                </div>
              </div>

              {profileDetails.subscriptions.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <i className={`fas fa-user-check ${isRTL ? 'ml-2' : 'mr-2'} text-[var(--color-primary)]`}></i>
                    {t('activeSubscriptionsTitle')}
                  </h3>
                  <div className="space-y-3">
                    {profileDetails.subscriptions.slice(0, 3).map((sub) => {
                      const isActive =
                        sub.status === 'active' && new Date(sub.end_date) > new Date();
                      const statusClass = isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800';
                      return (
                        <div
                          key={sub.id}
                          className="flex justify-between items-center p-3 bg-white rounded-lg border"
                        >
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {isRTL
                                ? sub.packages?.name_ar || sub.packages?.name_en
                                : sub.packages?.name_en || sub.packages?.name_ar}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {t('expires')} {formatDate(sub.end_date)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}
                          >
                            {isActive ? t('active') : t('expired')}
                          </span>
                        </div>
                      );
                    })}
                    {profileDetails.subscriptions.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        {t('moreSubscriptions').replace(
                          '{count}',
                          String(profileDetails.subscriptions.length - 3)
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <i className={`fas fa-star ${isRTL ? 'ml-2' : 'mr-2'} text-[var(--color-primary)]`}></i>
                  {t('trainingJourney')}
                </h3>
                <p className="text-sm text-gray-600">{t('trainingJourneyDesc')}</p>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <div
              className={`flex flex-col md:flex-row md:items-center ${isRTL ? 'md:space-x-reverse' : ''} md:space-x-3 space-y-3 md:space-y-0 w-full md:w-auto`}
            >
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center"
              >
                <i className={`fas fa-sign-out-alt ${isRTL ? 'ml-2' : 'mr-2'}`}></i>
                {t('logout')}
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
