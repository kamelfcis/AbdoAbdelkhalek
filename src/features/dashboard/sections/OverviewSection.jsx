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
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{c.t('total-videos-label')}</h3>
                    <button
                      onClick={() => c.setCurrentSection('videos')}
                      className="text-sm text-[var(--color-primary)] hover:underline"
                    >
                      {c.t('view-all')}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">{c.t('public-videos-label')}</p>
                      <p className="text-2xl font-bold text-green-600">{c.stats.publicVideos}</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">{c.t('private-videos-label')}</p>
                      <p className="text-2xl font-bold text-red-600">{c.stats.privateVideos}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center mr-3">
                      <i className="fas fa-bolt text-white"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{c.t('quick-shortcuts-title')}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        c.setEditingCategoryId(null);
                        c.setShowCategoryForm(true);
                      }}
                      className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-blue-200"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <i className="fas fa-folder-plus text-white text-lg"></i>
                      </div>
                      <span className="text-sm font-semibold text-blue-700">{c.t('add-category-text')}</span>
                    </button>
                    <button
                      onClick={() => {
                        c.setEditingVideoId(null);
                        c.setShowVideoForm(true);
                      }}
                      className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-green-200"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <i className="fas fa-video text-white text-lg"></i>
                      </div>
                      <span className="text-sm font-semibold text-green-700">{c.t('add-video-text')}</span>
                    </button>
                    <button
                      onClick={() => {
                        c.setEditingPackageId(null);
                        c.setShowPackageForm(true);
                      }}
                      className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-purple-200"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <i className="fas fa-box text-white text-lg"></i>
                      </div>
                      <span className="text-sm font-semibold text-purple-700">{c.t('add-package-text')}</span>
                    </button>
                    <button
                      onClick={() => {
                        c.setEditingStoryId(null);
                        c.setShowStoryForm(true);
                      }}
                      className="group flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-pink-200"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <i className="fas fa-star text-white text-lg"></i>
                      </div>
                      <span className="text-sm font-semibold text-pink-700">{c.t('add-story-text')}</span>
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
                      <h3 className="text-lg font-bold text-gray-800">{c.t('recent-activity-title')}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {c.recentActivitiesLoading ? (
                    <ListSkeleton count={5} />
                  ) : c.recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {c.recentActivities.map((activity) => {
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
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} flex items-center justify-center shadow-md flex-shrink-0 ${c.isRTL ? 'ml-4' : 'mr-4'}`}>
                              <i className={`fas fa-${activity.icon} text-white text-lg`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className={`font-semibold text-gray-800 mb-1 ${c.isRTL ? 'text-right' : 'text-left'}`}>
                                    {activity.title}
                                  </p>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <i className={`fas fa-${activity.icon} ${c.isRTL ? 'ml-2' : 'mr-2'}`}></i>
                                    <span className="capitalize">
                                      {c.t(`activity-type-${activity.type}`) || activity.type}
                                    </span>
                                  </div>
                                </div>
                                <div className={`text-xs text-gray-500 ${c.isRTL ? 'mr-4' : 'ml-4'} flex-shrink-0`}>
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
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-inbox text-gray-400 text-3xl"></i>
                      </div>
                      <p className="text-gray-500 text-lg font-medium">{c.t('no-activity')}</p>
                      <p className="text-gray-400 text-sm mt-2">{c.t('no-activity-hint')}</p>
                    </div>
                  )}
                </div>
              </div>
                </>
              )}
            </div>

  );
}
