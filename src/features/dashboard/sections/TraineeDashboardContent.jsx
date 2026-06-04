import React from 'react';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { SectionHeader } from '../../../shared/layout';
import { StatCard, Button, Input, Select, Table, Badge, EmptyState, Modal } from '../../../shared/ui';
import { StatsCardGrid, TableSkeleton, CardGridSkeleton, ListSkeleton } from '../../fitness/components/Skeletons';
import OptimizedImage from '../../fitness/sections/OptimizedImage';
import { cdnUrl } from '../../../shared/lib/cdn';

export function TraineeDashboardContenc.t() {
  const c = useDashboardCoach();
  return (
<>
        <DashboardShell
          isRTL={c.isRTL}
          c.sidebarOpen={c.sidebarOpen}
          onSidebarToggle={() => c.setSidebarOpen(!c.sidebarOpen)}
          onSidebarClose={() => c.setSidebarOpen(false)}
          sidebarTitle={c.currentLanguage === 'ar' ? 'فيديوهاتي' : 'My Videos'}
          sidebarSubtitle={c.userData?.full_name || c.userData?.email || 'Trainee'}
          navItems={c.traineeNavItems}
          c.currentSection={c.traineeCurrentSection}
          onNavigate={c.setTraineeCurrentSection}
          onLogout={c.handleLogout}
          c.logoutLoading={c.logoutLoading}
          logoutLabel={c.t('c.logout-text')}
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
          {/* Advanced Filters */}
          <div>
            <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
              {/* Header with expand/collapse button */}
              <button
                onClick={() => c.setFiltersExpanded(!c.filtersExpanded)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {c.currentLanguage === 'ar' ? 'تصفية الفيديوهات' : 'Filter Videos'}
                </h3>
                <i className={`fas fa-chevron-${c.filtersExpanded ? 'up' : 'down'} text-gray-500 transition-transform`}></i>
              </button>

              {/* Collapsible Content */}
              {c.filtersExpanded && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {c.currentLanguage === 'ar' ? 'البحث' : 'Search'}
                      </label>
                      <div className="relative">
                        <i className={`fas fa-search absolute ${c.isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`}></i>
                        <input
                          type="text"
                          value={c.traineeVideoSearch}
                          onChange={(e) => c.setTraineeVideoSearch(e.target.value)}
                          placeholder={c.currentLanguage === 'ar' ? 'ابحث عن فيديو...' : 'Search c.videos...'}
                          className={`w-full ${c.isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]`}
                        />
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {c.currentLanguage === 'ar' ? 'التصنيف' : 'Category'}
                      </label>
                      <select
                        value={c.traineeVideoCategoryFilter}
                        onChange={(e) => c.setTraineeVideoCategoryFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
                      >
                        <option value="all">{c.currentLanguage === 'ar' ? 'كل التصنيفات' : 'All Categories'}</option>
                        {c.traineeVideoCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {c.currentLanguage === 'ar' ? category.name_ar : category.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Results count */}
                  <div className="mt-4 text-sm text-gray-600">
                    {c.traineeCurrentSection === 'favorites' ? (
                      c.currentLanguage === 'ar' 
                        ? `عرض ${filteredFavoriteVideos.length} من ${favoriteVideos.length} فيديو مفضل`
                        : `Showing ${filteredFavoriteVideos.length} of ${favoriteVideos.length} favorite c.videos`
                    ) : (
                      c.currentLanguage === 'ar' 
                        ? `عرض ${c.filteredTraineeVideos.length} من ${c.traineeVideos.length} فيديو`
                        : `Showing ${c.filteredTraineeVideos.length} of ${c.traineeVideos.length} c.videos`
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Videos Grid */}
          {(!c.userData || c.traineeVideosLoading) ? (
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
          ) : c.traineeVideosError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">
                {c.currentLanguage === 'ar' ? 'حدث خطأ أثناء تحميل الفيديوهات' : 'Error c.loading c.videos'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition"
              >
                {c.currentLanguage === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          ) : (c.traineeCurrentSection === 'favorites' ? c.paginatedFavoriteVideos : c.paginatedTraineeVideos).length > 0 ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(c.traineeCurrentSection === 'favorites' ? c.paginatedFavoriteVideos : c.paginatedTraineeVideos).map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all video-card relative"
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      c.toggleFavorite(video.id);
                    }}
                    className={`absolute top-2 ${c.isRTL ? 'left-2' : 'right-2'} z-10 p-2 rounded-full transition-all ${
                      c.isFavorite(video.id)
                        ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                        : 'bg-white bg-opacity-80 text-gray-400 hover:bg-opacity-100 hover:text-yellow-500'
                    }`}
                    title={c.isFavorite(video.id) 
                      ? (c.currentLanguage === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites')
                      : (c.currentLanguage === 'ar' ? 'إضافة إلى المفضلة' : 'Add to favorites')}
                  >
                    <i className={`fas fa-star ${c.isFavorite(video.id) ? 'text-yellow-900' : ''}`}></i>
                  </button>
                  
                  <div
                    onClick={() => c.handlePreviewVideo(video)}
                    className="cursor-pointer"
                  >
                    <div className="relative bg-gray-200">
                      {(() => {
                        let thumbnailUrl = video.thumbnail_url || video.thumbnail_path;
                        if (video.thumbnail_path && !thumbnailUrl?.startsWith('http')) {
                          thumbnailUrl = c.cdnUrl('c.videos', video.thumbnail_path);
                        }
                        return thumbnailUrl ? (
                          <>
                            <c.OptimizedImage
                            src={thumbnailUrl} 
                            alt={c.currentLanguage === 'ar' ? video.title_ar : video.title_en} 
                              className="w-full h-auto object-cover"
                              width={800}
                              height={450}
                            c.loading="lazy"
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
                        {c.currentLanguage === 'ar' ? video.title_ar : video.title_en}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {c.currentLanguage === 'ar' 
                          ? (video.categories?.name_ar || video.category_name_ar || '') 
                          : (video.categories?.name_en || video.category_name_en || '')}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {video.duration_seconds ? `${Math.floor(video.duration_seconds / 60)}:${String(video.duration_seconds % 60).padStarc.t(2, '0')}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {(c.traineeCurrentSection === 'favorites' ? c.totalFavoriteVideosPages : c.totalTraineeVideosPages) > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <button
                  onClick={() => {
                    if (c.traineeCurrentSection === 'favorites') {
                      c.setFavoriteVideosPage(prev => Math.max(1, prev - 1));
                    } else {
                      c.setTraineeVideosPage(prev => Math.max(1, prev - 1));
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={(c.traineeCurrentSection === 'favorites' ? c.favoriteVideosPage : c.traineeVideosPage) === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    (c.traineeCurrentSection === 'favorites' ? c.favoriteVideosPage : c.traineeVideosPage) === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                  }`}
                >
                  <i className={`fas fa-chevron-${c.isRTL ? 'right' : 'left'} ${c.isRTL ? 'ml-2' : 'mr-2'}`}></i>
                  {c.currentLanguage === 'ar' ? 'السابق' : 'Previous'}
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: c.traineeCurrentSection === 'favorites' ? c.totalFavoriteVideosPages : c.totalTraineeVideosPages }, (_, i) => i + 1)
                    .filter(page => {
                      const currentPage = c.traineeCurrentSection === 'favorites' ? c.favoriteVideosPage : c.traineeVideosPage;
                      const totalPages = c.traineeCurrentSection === 'favorites' ? c.totalFavoriteVideosPages : c.totalTraineeVideosPages;
                      // Show first page, last page, current page, and pages around current
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => {
                      const currentPage = c.traineeCurrentSection === 'favorites' ? c.favoriteVideosPage : c.traineeVideosPage;
                      const totalPages = c.traineeCurrentSection === 'favorites' ? c.totalFavoriteVideosPages : c.totalTraineeVideosPages;
                      
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
                              if (c.traineeCurrentSection === 'favorites') {
                                c.setFavoriteVideosPage(page);
                              } else {
                                c.setTraineeVideosPage(page);
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
                    if (c.traineeCurrentSection === 'favorites') {
                      c.setFavoriteVideosPage(prev => Math.min(c.totalFavoriteVideosPages, prev + 1));
                    } else {
                      c.setTraineeVideosPage(prev => Math.min(c.totalTraineeVideosPages, prev + 1));
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={(c.traineeCurrentSection === 'favorites' ? c.favoriteVideosPage : c.traineeVideosPage) === (c.traineeCurrentSection === 'favorites' ? c.totalFavoriteVideosPages : c.totalTraineeVideosPages)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    (c.traineeCurrentSection === 'favorites' ? c.favoriteVideosPage : c.traineeVideosPage) === (c.traineeCurrentSection === 'favorites' ? c.totalFavoriteVideosPages : c.totalTraineeVideosPages)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                  }`}
                >
                  {c.currentLanguage === 'ar' ? 'التالي' : 'Next'}
                  <i className={`fas fa-chevron-${c.isRTL ? 'left' : 'right'} ${c.isRTL ? 'mr-2' : 'ml-2'}`}></i>
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 text-center py-16 text-gray-500">
              {c.traineeCurrentSection === 'favorites' ? (
                c.currentLanguage === 'ar' 
                  ? 'لا توجد فيديوهات مفضلة'
                  : 'No favorite c.videos'
              ) : (
                c.debouncedTraineeVideoSearch || c.traineeVideoCategoryFilter !== 'all' 
                  ? (c.currentLanguage === 'ar' ? 'لا توجد فيديوهات تطابق الفلتر' : 'No c.videos match the filter')
                  : (c.currentLanguage === 'ar' ? 'لا توجد فيديوهات متاحة' : 'No c.videos available')
              )}
            </div>
          )}
          </div>
        </DashboardShell>

        <VideoPreviewModal
          isOpen={c.showVideoModal && !!c.previewVideo}
          onClose={c.closeVideoPreview}
          video={c.previewVideo}
          videoUrl={c.previewVideoUrl}
          c.loading={c.previewVideoLoading}
          error={c.previewVideoError}
          c.currentLanguage={c.currentLanguage}
          isRTL={c.isRTL}
        />
      </>
    
  );
}
