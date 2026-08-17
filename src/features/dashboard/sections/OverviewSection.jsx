import React from 'react';
import { useDashboardCoach } from '../context/DashboardCoachContext';
import { SectionHeader } from '../../../shared/layout';
import { StatCard, Button, Input, Select, Table, Badge, EmptyState, Modal } from '../../../shared/ui';
import { StatsCardGrid, TableSkeleton, CardGridSkeleton, ListSkeleton } from '../../fitness/components/Skeletons';
import OptimizedImage from '../../fitness/sections/OptimizedImage';
import { cdnUrl } from '../../../shared/lib/cdn';

export function OverviewSection() {
  const c = useDashboardCoach();
  return (
            <div className="section">
              {c.statsLoading ? (
                <StatsCardGrid count={8} />
              ) : (
                <>
              <SectionHeader
                title={c.getPageTitle()}
                subtitle={c.t('welcome-text')}
              />
              {/* Main Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                  label={c.t('total-trainees-label')}
                  value={c.stats.trainees}
                  icon="fa-users"
                  color="blue"
                  footer={c.viewAllLabel}
                  isRTL={c.isRTL}
                  onClick={() => c.setCurrentSection('trainees')}
                />
                <StatCard
                  label={c.t('total-videos-label')}
                  value={c.stats.videos}
                  icon="fa-video"
                  color="green"
                  footer={c.viewAllLabel}
                  isRTL={c.isRTL}
                  onClick={() => c.setCurrentSection('videos')}
                />
                <StatCard
                  label={c.t('total-packages-label')}
                  value={c.stats.packages}
                  icon="fa-box"
                  color="purple"
                  footer={c.viewAllLabel}
                  isRTL={c.isRTL}
                  onClick={() => c.setCurrentSection('packages')}
                />
                <StatCard
                  label={c.t('total-categories-label')}
                  value={c.stats.categories}
                  icon="fa-folder"
                  color="yellow"
                  footer={c.viewAllLabel}
                  isRTL={c.isRTL}
                  onClick={() => c.setCurrentSection('categories')}
                />
              </div>

              {/* Additional Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                  label={c.t('active-subscriptions-label')}
                  value={c.stats.activeSubscriptions}
                  icon="fa-user-check"
                  color="indigo"
                  footer={`${c.stats.totalSubscriptions} ${c.t('label-total')}`}
                  isRTL={c.isRTL}
                  onClick={() => c.setCurrentSection('subscriptions')}
                />
                <StatCard
                  label={c.t('success-stories-label')}
                  value={c.stats.successStories}
                  icon="fa-star"
                  color="red"
                  footer={c.viewAllLabel}
                  isRTL={c.isRTL}
                  onClick={() => c.setCurrentSection('success-stories')}
                />
                <StatCard
                  label={c.t('reviews-label')}
                  value={c.stats.reviews}
                  icon="fa-comments"
                  color="orange"
                  footer={c.viewAllLabel}
                  isRTL={c.isRTL}
                  onClick={() => c.setCurrentSection('reviews')}
                />
                <StatCard
                  label={c.t('faqs-label')}
                  value={c.stats.faqs}
                  icon="fa-question-circle"
                  color="teal"
                  footer={c.viewAllLabel}
                  isRTL={c.isRTL}
                  onClick={() => c.setCurrentSection('faqs')}
                />
              </div>

              {/* Video Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="dashboard-panel p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">{c.t('total-videos-label')}</h3>
                    <button
                      onClick={() => c.setCurrentSection('videos')}
                      className="text-sm text-[var(--color-primary)] hover:underline"
                    >
                      {c.t('view-all')}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-[var(--color-success)]/10 rounded-lg">
                      <p className="text-sm text-[var(--color-text-muted)] mb-1">{c.t('public-videos-label')}</p>
                      <p className="text-2xl font-bold text-[var(--color-success)]">{c.stats.publicVideos}</p>
                    </div>
                    <div className="text-center p-4 bg-[var(--color-danger)]/10 rounded-lg">
                      <p className="text-sm text-[var(--color-text-muted)] mb-1">{c.t('private-videos-label')}</p>
                      <p className="text-2xl font-bold text-[var(--color-danger)]">{c.stats.privateVideos}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="dashboard-panel p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3">
                      <i className="fas fa-bolt text-[var(--color-text-inverse)]"></i>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--color-text)]">{c.t('quick-shortcuts-title')}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        c.setEditingCategoryId(null);
                        c.setShowCategoryForm(true);
                      }}
                      className="group flex flex-col items-center justify-center p-4 bg-[var(--color-info)]/10 hover:bg-[var(--color-info)]/20 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-[var(--color-info)]/25"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-info)] flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <i className="fas fa-folder-plus text-[var(--color-text-inverse)] text-lg"></i>
                      </div>
                      <span className="text-sm font-semibold text-[var(--color-info)]">{c.t('add-category-text')}</span>
                    </button>
                    <button
                      onClick={() => {
                        c.setEditingVideoId(null);
                        c.setShowVideoForm(true);
                      }}
                      className="group flex flex-col items-center justify-center p-4 bg-[var(--color-success)]/10 hover:bg-[var(--color-success)]/20 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-[var(--color-success)]/25"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-success)] flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <i className="fas fa-video text-[var(--color-text-inverse)] text-lg"></i>
                      </div>
                      <span className="text-sm font-semibold text-[var(--color-success)]">{c.t('add-video-text')}</span>
                    </button>
                    <button
                      onClick={() => {
                        c.setEditingPackageId(null);
                        c.setShowPackageForm(true);
                      }}
                      className="group flex flex-col items-center justify-center p-4 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-[var(--color-accent)]/25"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-accent)] flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <i className="fas fa-box text-[var(--color-text-inverse)] text-lg"></i>
                      </div>
                      <span className="text-sm font-semibold text-[var(--color-accent)]">{c.t('add-package-text')}</span>
                    </button>
                    <button
                      onClick={() => {
                        c.setEditingStoryId(null);
                        c.setShowStoryForm(true);
                      }}
                      className="group flex flex-col items-center justify-center p-4 bg-[var(--color-warning)]/10 hover:bg-[var(--color-warning)]/20 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-[var(--color-warning)]/25"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-warning)] flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <i className="fas fa-star text-[var(--color-text-inverse)] text-lg"></i>
                      </div>
                      <span className="text-sm font-semibold text-[var(--color-warning)]">{c.t('add-story-text')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="dashboard-panel overflow-hidden">
                <div className="p-6 border-b border-[var(--color-border)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3">
                        <i className="fas fa-clock text-[var(--color-text-inverse)]"></i>
                      </div>
                      <h3 className="text-lg font-bold text-[var(--color-text)]">{c.t('recent-activity-title')}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {c.recentActivitiesLoading ? (
                    <ListSkeleton count={5} />
                  ) : c.recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {c.recentActivities.map((activity) => {
                        const iconColorClasses = {
                          blue: 'bg-[var(--color-info)]',
                          green: 'bg-[var(--color-success)]',
                          purple: 'bg-[var(--color-accent)]',
                          indigo: 'bg-[var(--color-primary)]',
                          pink: 'bg-[var(--color-danger)]',
                          orange: 'bg-[var(--color-warning)]',
                          teal: 'bg-[var(--color-secondary)]',
                        };
                        const iconColorClass = iconColorClasses[activity.color] || iconColorClasses.blue;

                        return (
                          <div key={activity.id} className="flex items-start p-4 bg-[var(--color-surface-raised)] rounded-lg border border-[var(--color-border)] hover:shadow-md transition-all duration-200">
                            <div className={`w-12 h-12 rounded-xl ${iconColorClass} flex items-center justify-center shadow-md flex-shrink-0 ${c.isRTL ? 'ml-4' : 'mr-4'}`}>
                              <i className={`fas fa-${activity.icon} text-[var(--color-text-inverse)] text-lg`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className={`font-semibold text-[var(--color-text)] mb-1 ${c.isRTL ? 'text-right' : 'text-left'}`}>
                                    {activity.title}
                                  </p>
                                  <div className="flex items-center text-xs text-[var(--color-text-muted)]">
                                    <i className={`fas fa-${activity.icon} ${c.isRTL ? 'ml-2' : 'mr-2'}`}></i>
                                    <span className="capitalize">
                                      {c.t(`activity-type-${activity.type}`) || activity.type}
                                    </span>
                                  </div>
                                </div>
                                <div className={`text-xs text-[var(--color-text-muted)] ${c.isRTL ? 'mr-4' : 'ml-4'} flex-shrink-0`}>
                                  <i className="far fa-clock mr-1"></i>
                                  {c.getTimeAgo(activity.time)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-inbox text-[var(--color-text-muted)] text-3xl"></i>
                      </div>
                      <p className="text-[var(--color-text-muted)] text-lg font-medium">{c.t('no-activity')}</p>
                      <p className="text-[var(--color-text-muted)] text-sm mt-2">{c.t('no-activity-hint')}</p>
                    </div>
                  )}
                </div>
              </div>
                </>
              )}
            </div>

  );
}
