import React from 'react';
import { DashboardShell } from '../../../shared/layout';
import {
  Badge,
  Card,
  EmptyState,
  Input,
  Skeleton,
  ToggleGroup,
  ToggleGroupItem,
} from '../../../shared/ui';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { EntityPaginationBar } from '../crud/EntityPaginationBar';
import {
  VISIBILITY_ALL,
  VISIBILITY_PUBLIC,
  VISIBILITY_PRIVATE,
} from '../components/trainee-access/accessUtils';
import { TraineeVideosCardGrid } from './TraineeVideosCardGrid';

function TraineePagination({ c }) {
  const isFavorites = c.traineeCurrentSection === 'favorites';
  const currentPage = isFavorites ? c.favoriteVideosPage : c.traineeVideosPage;
  const totalPages = isFavorites ? c.totalFavoriteVideosPages : c.totalTraineeVideosPages;
  const setPage = isFavorites ? c.setFavoriteVideosPage : c.setTraineeVideosPage;
  const total = isFavorites ? c.filteredFavoriteVideos.length : c.filteredTraineeVideos.length;

  const handlePageChange = (page) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <EntityPaginationBar
      t={c.t}
      isRTL={c.isRTL}
      page={currentPage}
      pageCount={totalPages}
      total={total}
      pageSize={c.traineeVideosPageSize}
      onPageChange={handlePageChange}
    />
  );
}

function hasActiveTraineeFilters(c) {
  return (
    Boolean(c.debouncedTraineeVideoSearch) ||
    c.traineeVideoCategoryFilter !== 'all' ||
    c.traineeVideoVisibilityFilter !== VISIBILITY_ALL
  );
}

function TraineeFilterPanel({ c, isFavorites, filteredCount, totalCount }) {
  const isAr = c.currentLanguage === 'ar';
  const allCategoriesLabel = isAr ? 'كل التصنيفات' : 'All Categories';
  const activeCategory = c.traineeVideoCategories.find(
    (cat) => String(cat.id) === String(c.traineeVideoCategoryFilter)
  );
  const activeCategoryLabel = activeCategory
    ? isAr
      ? activeCategory.name_ar || activeCategory.name_en
      : activeCategory.name_en || activeCategory.name_ar
    : null;

  const clearAllFilters = () => {
    c.setTraineeVideoSearch('');
    c.setTraineeVideoCategoryFilter('all');
    c.setTraineeVideoVisibilityFilter(VISIBILITY_ALL);
  };

  return (
    <Card
      variant="elevated"
      className="mb-6 shadow-sm"
      bodyClassName="p-0"
    >
      <button
        type="button"
        onClick={() => c.setFiltersExpanded(!c.filtersExpanded)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-[var(--color-bg-muted)]/60 transition-colors"
        aria-expanded={c.filtersExpanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <i className="fas fa-sliders-h text-sm" aria-hidden="true" />
          </span>
          <div className="text-start min-w-0">
            <h3 className="text-base font-semibold text-[var(--color-text)]">
              {isAr ? 'تصفية الفيديوهات' : 'Filter Videos'}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] truncate">
              {isFavorites
                ? isAr
                  ? `${filteredCount} من ${totalCount} فيديو مفضل`
                  : `${filteredCount} of ${totalCount} favorite videos`
                : isAr
                  ? `${filteredCount} من ${totalCount} فيديو`
                  : `${filteredCount} of ${totalCount} videos`}
            </p>
          </div>
        </div>
        <i
          className={`fas fa-chevron-${c.filtersExpanded ? 'up' : 'down'} text-[var(--color-text-muted)] transition-transform duration-200 shrink-0`}
          aria-hidden="true"
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          c.filtersExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1 space-y-5 border-t border-[var(--color-border)]">
            <Input
              type="search"
              label={isAr ? 'البحث' : 'Search'}
              value={c.traineeVideoSearch}
              onChange={(e) => c.setTraineeVideoSearch(e.target.value)}
              placeholder={isAr ? 'ابحث عن فيديو...' : 'Search videos...'}
              isRTL={c.isRTL}
              leftIcon={<i className="fas fa-search text-sm" aria-hidden="true" />}
            />

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="block text-sm font-medium text-[var(--color-text)]">
                  {isAr ? 'التصنيف' : 'Category'}
                </label>
                {c.traineeCategoriesLoading && (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {isAr ? 'جارٍ التحميل…' : 'Loading…'}
                  </span>
                )}
              </div>

              {c.traineeCategoriesLoading && c.traineeVideoCategories.length === 0 ? (
                <div className="flex gap-2 overflow-hidden">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} variant="rect" className="h-9 w-24 shrink-0 rounded-full" />
                  ))}
                </div>
              ) : (
                <div
                  className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin"
                  role="group"
                  aria-label={isAr ? 'تصفية حسب التصنيف' : 'Filter by category'}
                >
                  <button
                    type="button"
                    onClick={() => c.setTraineeVideoCategoryFilter('all')}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                      c.traineeVideoCategoryFilter === 'all'
                        ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary)] shadow-sm'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]'
                    }`}
                  >
                    {allCategoriesLabel}
                  </button>
                  {c.traineeVideoCategories.map((category) => {
                    const label = isAr
                      ? category.name_ar || category.name_en
                      : category.name_en || category.name_ar;
                    const isActive = String(c.traineeVideoCategoryFilter) === String(category.id);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => c.setTraineeVideoCategoryFilter(String(category.id))}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                          isActive
                            ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary)] shadow-sm'
                            : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]'
                        }`}
                      >
                        {label || category.id}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                {isAr ? 'الظهور' : 'Visibility'}
              </label>
              <ToggleGroup
                type="single"
                value={c.traineeVideoVisibilityFilter}
                onValueChange={(val) => c.setTraineeVideoVisibilityFilter(val || VISIBILITY_ALL)}
                aria-label={c.t('trainee-access-filter-visibility-all')}
                className={c.isRTL ? 'flex-row-reverse' : ''}
              >
                <ToggleGroupItem value={VISIBILITY_ALL}>
                  {c.t('trainee-access-filter-visibility-all')}
                </ToggleGroupItem>
                <ToggleGroupItem value={VISIBILITY_PUBLIC}>
                  {c.t('trainee-access-filter-visibility-public')}
                </ToggleGroupItem>
                <ToggleGroupItem value={VISIBILITY_PRIVATE}>
                  {c.t('trainee-access-filter-visibility-private')}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {hasActiveTraineeFilters(c) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  {isAr ? 'فلاتر نشطة:' : 'Active filters:'}
                </span>
                {c.debouncedTraineeVideoSearch && (
                  <Badge variant="primary" className="gap-1.5 py-1 ps-2.5 pe-1.5">
                    <span className="max-w-[140px] truncate">
                      {isAr ? 'بحث:' : 'Search:'} {c.debouncedTraineeVideoSearch}
                    </span>
                    <button
                      type="button"
                      onClick={() => c.setTraineeVideoSearch('')}
                      className="rounded-full p-0.5 hover:bg-[var(--color-primary)]/20 transition-colors"
                      aria-label={isAr ? 'مسح البحث' : 'Clear search'}
                    >
                      <i className="fas fa-times text-[10px]" aria-hidden="true" />
                    </button>
                  </Badge>
                )}
                {c.traineeVideoCategoryFilter !== 'all' && activeCategoryLabel && (
                  <Badge variant="primary" className="gap-1.5 py-1 ps-2.5 pe-1.5">
                    <span className="max-w-[140px] truncate">{activeCategoryLabel}</span>
                    <button
                      type="button"
                      onClick={() => c.setTraineeVideoCategoryFilter('all')}
                      className="rounded-full p-0.5 hover:bg-[var(--color-primary)]/20 transition-colors"
                      aria-label={isAr ? 'مسح التصنيف' : 'Clear category'}
                    >
                      <i className="fas fa-times text-[10px]" aria-hidden="true" />
                    </button>
                  </Badge>
                )}
                {c.traineeVideoVisibilityFilter !== VISIBILITY_ALL && (
                  <Badge variant="primary" className="gap-1.5 py-1 ps-2.5 pe-1.5">
                    <span>
                      {c.traineeVideoVisibilityFilter === VISIBILITY_PUBLIC
                        ? c.t('trainee-access-filter-visibility-public')
                        : c.t('trainee-access-filter-visibility-private')}
                    </span>
                    <button
                      type="button"
                      onClick={() => c.setTraineeVideoVisibilityFilter(VISIBILITY_ALL)}
                      className="rounded-full p-0.5 hover:bg-[var(--color-primary)]/20 transition-colors"
                      aria-label={isAr ? 'مسح فلتر الظهور' : 'Clear visibility filter'}
                    >
                      <i className="fas fa-times text-[10px]" aria-hidden="true" />
                    </button>
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-medium text-[var(--color-primary)] hover:underline ms-1"
                >
                  {isAr ? 'مسح الكل' : 'Clear all'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function TraineeDashboardContent() {
  const c = useDashboardCoach();
  const isFavorites = c.traineeCurrentSection === 'favorites';
  const activeVideos = isFavorites ? c.paginatedFavoriteVideos : c.paginatedTraineeVideos;
  const filteredCount = isFavorites
    ? c.filteredFavoriteVideos.length
    : c.filteredTraineeVideos.length;
  const totalCount = isFavorites ? c.favoriteVideos.length : c.traineeVideos.length;
  const isAr = c.currentLanguage === 'ar';
  const traineePageTitle = isFavorites
    ? isAr
      ? 'مفضلاتي'
      : 'My Favorites'
    : isAr
      ? 'فيديوهاتي'
      : 'My Videos';

  return (
    <DashboardShell
      isRTL={c.isRTL}
      sidebarOpen={c.sidebarOpen}
      onSidebarToggle={() => c.setSidebarOpen(!c.sidebarOpen)}
      onSidebarClose={() => c.setSidebarOpen(false)}
      sidebarTitle={isAr ? 'فيديوهاتي' : 'My Videos'}
      sidebarSubtitle={c.userData?.full_name || c.userData?.email || 'Trainee'}
      navItems={c.traineeNavItems}
      currentSection={c.traineeCurrentSection}
      onNavigate={c.setTraineeCurrentSection}
      onLogout={c.handleLogout}
      logoutLoading={c.logoutLoading}
      logoutLabel={c.t('logout-text')}
      loggingOutLabel={isAr ? 'جاري تسجيل الخروج...' : 'Logging out...'}
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
          <span>{isAr ? 'الرئيسية' : 'Home'}</span>
        </button>
      }
    >
      <div>
        <TraineeFilterPanel
          c={c}
          isFavorites={isFavorites}
          filteredCount={filteredCount}
          totalCount={totalCount}
        />

        {!c.userData || c.traineeVideosLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} variant="elevated" bodyClassName="p-0">
                <Skeleton variant="rect" className="h-48 rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton variant="title" />
                  <Skeleton variant="text" className="w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : c.traineeVideosError ? (
          <EmptyState
            icon="fa-exclamation-circle"
            title={isAr ? 'حدث خطأ أثناء تحميل الفيديوهات' : 'Error loading videos'}
            description={
              isAr
                ? 'تعذر تحميل الفيديوهات. يرجى المحاولة مرة أخرى.'
                : 'We could not load your videos. Please try again.'
            }
            actionLabel={isAr ? 'إعادة المحاولة' : 'Retry'}
            onAction={() => window.location.reload()}
          />
        ) : activeVideos.length > 0 ? (
          <>
            <TraineeVideosCardGrid videos={activeVideos} />
            <TraineePagination c={c} />
          </>
        ) : (
          <EmptyState
            icon={isFavorites ? 'fa-star' : 'fa-video'}
            title={
              isFavorites
                ? hasActiveTraineeFilters(c)
                  ? isAr
                    ? 'لا توجد فيديوهات مفضلة تطابق الفلتر'
                    : 'No favorite videos match the filter'
                  : isAr
                    ? 'لا توجد فيديوهات مفضلة'
                    : 'No favorite videos'
                : hasActiveTraineeFilters(c)
                  ? isAr
                    ? 'لا توجد فيديوهات تطابق الفلتر'
                    : 'No videos match the filter'
                  : isAr
                    ? 'لا توجد فيديوهات متاحة'
                    : 'No videos available'
            }
            description={
              hasActiveTraineeFilters(c)
                ? isAr
                  ? 'جرّب تعديل البحث أو التصنيف أو فلتر الظهور.'
                  : 'Try adjusting your search, category, or visibility filters.'
                : isFavorites
                  ? isAr
                    ? 'اضغط على نجمة أي فيديو لإضافته إلى مفضلاتك.'
                    : 'Tap the star on any video to add it to your favorites.'
                  : isAr
                    ? 'ستظهر الفيديوهات المتاحة لك هنا عند منحك الوصول.'
                    : 'Videos you have access to will appear here.'
            }
            actionLabel={hasActiveTraineeFilters(c) ? (isAr ? 'مسح الفلاتر' : 'Clear filters') : undefined}
            onAction={
              hasActiveTraineeFilters(c)
                ? () => {
                    c.setTraineeVideoSearch('');
                    c.setTraineeVideoCategoryFilter('all');
                    c.setTraineeVideoVisibilityFilter(VISIBILITY_ALL);
                  }
                : undefined
            }
          />
        )}
      </div>
    </DashboardShell>
  );
}
