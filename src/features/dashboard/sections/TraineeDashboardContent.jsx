import React from 'react';
import { DashboardShell } from '../../../shared/layout';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { TraineeVideosCardGrid } from './TraineeVideosCardGrid';

function TraineePagination({ c }) {
  const isFavorites = c.traineeCurrentSection === 'favorites';
  const currentPage = isFavorites ? c.favoriteVideosPage : c.traineeVideosPage;
  const totalPages = isFavorites ? c.totalFavoriteVideosPages : c.totalTraineeVideosPages;
  const setPage = isFavorites ? c.setFavoriteVideosPage : c.setTraineeVideosPage;

  if (totalPages <= 1) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter((page) => {
    return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
  });

  return (
    <div className="mt-8 flex justify-center items-center space-x-2">
      <button
        type="button"
        onClick={() => {
          setPage((prev) => Math.max(1, prev - 1));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          currentPage === 1
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
        }`}
      >
        <i className={`fas fa-chevron-${c.isRTL ? 'right' : 'left'} ${c.isRTL ? 'ml-2' : 'mr-2'}`} />
        {c.currentLanguage === 'ar' ? 'السابق' : 'Previous'}
      </button>

      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index, array) => {
          const showEllipsisBefore = index > 0 && array[index - 1] < page - 1;
          const showEllipsisAfter = index < array.length - 1 && array[index + 1] > page + 1;

          return (
            <React.Fragment key={page}>
              {showEllipsisBefore && <span className="px-2 text-gray-500">...</span>}
              <button
                type="button"
                onClick={() => {
                  setPage(page);
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
              {showEllipsisAfter && <span className="px-2 text-gray-500">...</span>}
            </React.Fragment>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          setPage((prev) => Math.min(totalPages, prev + 1));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          currentPage === totalPages
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
        }`}
      >
        {c.currentLanguage === 'ar' ? 'التالي' : 'Next'}
        <i className={`fas fa-chevron-${c.isRTL ? 'left' : 'right'} ${c.isRTL ? 'mr-2' : 'ml-2'}`} />
      </button>
    </div>
  );
}

export function TraineeDashboardContent() {
  const c = useDashboardCoach();
  const isFavorites = c.traineeCurrentSection === 'favorites';
  const activeVideos = isFavorites ? c.paginatedFavoriteVideos : c.paginatedTraineeVideos;
  const traineePageTitle = isFavorites
    ? c.currentLanguage === 'ar'
      ? 'مفضلاتي'
      : 'My Favorites'
    : c.currentLanguage === 'ar'
      ? 'فيديوهاتي'
      : 'My Videos';

  return (
    <DashboardShell
      isRTL={c.isRTL}
      sidebarOpen={c.sidebarOpen}
      onSidebarToggle={() => c.setSidebarOpen(!c.sidebarOpen)}
      onSidebarClose={() => c.setSidebarOpen(false)}
      sidebarTitle={c.currentLanguage === 'ar' ? 'فيديوهاتي' : 'My Videos'}
      sidebarSubtitle={c.userData?.full_name || c.userData?.email || 'Trainee'}
      navItems={c.traineeNavItems}
      currentSection={c.traineeCurrentSection}
      onNavigate={c.setTraineeCurrentSection}
      onLogout={c.handleLogout}
      logoutLoading={c.logoutLoading}
      logoutLabel={c.t('logout-text')}
      loggingOutLabel={c.currentLanguage === 'ar' ? 'جاري تسجيل الخروج...' : 'Logging out...'}
      onToggleLanguage={c.toggleLanguage}
      languageToggleLabel={c.currentLanguage === 'en' ? 'العربية' : 'English'}
      pageTitle={traineePageTitle}
      userDisplayName={c.userData?.full_name || c.userData?.email || 'Trainee'}
      navbarExtraActions={
        <button
          type="button"
          onClick={() => c.navigate('/')}
          className="hidden sm:flex items-center gap-2 px-3 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-muted)] rounded-lg transition text-sm font-medium"
        >
          <i className="fas fa-home" aria-hidden="true" />
          <span>{c.currentLanguage === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>
      }
    >
      <div>
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <button
            type="button"
            onClick={() => c.setFiltersExpanded(!c.filtersExpanded)}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {c.currentLanguage === 'ar' ? 'تصفية الفيديوهات' : 'Filter Videos'}
            </h3>
            <i
              className={`fas fa-chevron-${c.filtersExpanded ? 'up' : 'down'} text-gray-500 transition-transform`}
            />
          </button>

          {c.filtersExpanded && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {c.currentLanguage === 'ar' ? 'البحث' : 'Search'}
                  </label>
                  <div className="relative">
                    <i
                      className={`fas fa-search absolute ${c.isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`}
                    />
                    <input
                      type="text"
                      value={c.traineeVideoSearch}
                      onChange={(e) => c.setTraineeVideoSearch(e.target.value)}
                      placeholder={
                        c.currentLanguage === 'ar' ? 'ابحث عن فيديو...' : 'Search videos...'
                      }
                      className={`w-full ${c.isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {c.currentLanguage === 'ar' ? 'التصنيف' : 'Category'}
                  </label>
                  <select
                    value={c.traineeVideoCategoryFilter}
                    onChange={(e) => c.setTraineeVideoCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
                  >
                    <option value="all">
                      {c.currentLanguage === 'ar' ? 'كل التصنيفات' : 'All Categories'}
                    </option>
                    {c.traineeVideoCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {c.currentLanguage === 'ar' ? category.name_ar : category.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                {isFavorites
                  ? c.currentLanguage === 'ar'
                    ? `عرض ${c.filteredFavoriteVideos.length} من ${c.favoriteVideos.length} فيديو مفضل`
                    : `Showing ${c.filteredFavoriteVideos.length} of ${c.favoriteVideos.length} favorite videos`
                  : c.currentLanguage === 'ar'
                    ? `عرض ${c.filteredTraineeVideos.length} من ${c.traineeVideos.length} فيديو`
                    : `Showing ${c.filteredTraineeVideos.length} of ${c.traineeVideos.length} videos`}
              </div>
            </div>
          )}
        </div>

        {!c.userData || c.traineeVideosLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : c.traineeVideosError ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">
              {c.currentLanguage === 'ar' ? 'حدث خطأ أثناء تحميل الفيديوهات' : 'Error loading videos'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition"
            >
              {c.currentLanguage === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : activeVideos.length > 0 ? (
          <>
            <TraineeVideosCardGrid videos={activeVideos} />
            <TraineePagination c={c} />
          </>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 text-center py-16 text-gray-500">
            {isFavorites
              ? c.currentLanguage === 'ar'
                ? 'لا توجد فيديوهات مفضلة'
                : 'No favorite videos'
              : c.debouncedTraineeVideoSearch || c.traineeVideoCategoryFilter !== 'all'
                ? c.currentLanguage === 'ar'
                  ? 'لا توجد فيديوهات تطابق الفلتر'
                  : 'No videos match the filter'
                : c.currentLanguage === 'ar'
                  ? 'لا توجد فيديوهات متاحة'
                  : 'No videos available'}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
