import { useState } from 'react';
import { getContentService } from '../../../shared/lib/getContentService';
import { showSuccess, showError } from '../../../shared/lib/notifications';
import { invalidateAccessCrud } from '../../../shared/lib/queryKeys';
import { confirmEntityDelete } from '../crud/EntityDeleteDialog';

export function useDashboardAccessModals({
  adminDomain,
  queryClient,
  currentLanguage,
  packages,
  setCurrentSection,
}) {
  const contentService = getContentService(adminDomain);
  const isAr = currentLanguage === 'ar';
  const [showTraineeAccessModal, setShowTraineeAccessModal] = useState(false);
  const [activeTrainee, setActiveTrainee] = useState(null);
  const [showConvertToSubscriptionModal, setShowConvertToSubscriptionModal] = useState(false);
  const [traineeForConversion, setTraineeForConversion] = useState(null);

  const handleManageSubscription = async (subscriptionId, newStatus) => {
    try {
      await contentService.updateSubscription(subscriptionId, { status: newStatus });
      showSuccess(isAr ? 'تم تحديث الحالة' : 'Status updated successfully');
      invalidateAccessCrud(queryClient, adminDomain);
    } catch (error) {
      showError(error.message || 'Error updating status');
    }
  };

  const handleDeleteSubscription = async (id) => {
    try {
      await contentService.deleteSubscription(id);
      showSuccess(isAr ? 'تم حذف الاشتراك بنجاح' : 'Subscription has been deleted');
      invalidateAccessCrud(queryClient, adminDomain);
    } catch (error) {
      showError(error.message || 'Error deleting subscription');
    }
  };

  const handleDeleteTrainee = async (userId) => {
    const confirmed = await confirmEntityDelete({
      isAr,
      message: isAr
        ? 'سيتم حذف المتدرب وجميع بياناته نهائياً'
        : 'This trainee and all their data will be permanently deleted.',
    });
    if (!confirmed) return;
    try {
      await contentService.deleteTrainee(userId);
      showSuccess(isAr ? 'تم حذف المتدرب' : 'Trainee deleted');
      invalidateAccessCrud(queryClient, adminDomain);
    } catch (err) {
      showError(err.message || 'Error deleting trainee');
    }
  };

  const handleConvertToSubscription = async (traineeId, packageId) => {
    try {
      const selectedPackage = packages.find((pkg) => pkg.id === packageId);
      if (!selectedPackage) {
        showError(isAr ? 'الباقة غير موجودة' : 'Package not found');
        return;
      }
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (selectedPackage.duration_days || 30));
      await contentService.createSubscription({
        userId: traineeId,
        packageId,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
      });
      showSuccess(isAr ? 'تم تحويل المتدرب إلى اشتراك بنجاح' : 'Trainee converted to subscription successfully');
      setShowConvertToSubscriptionModal(false);
      setTraineeForConversion(null);
      invalidateAccessCrud(queryClient, adminDomain);
      setTimeout(() => setCurrentSection('subscriptions'), 1000);
    } catch (error) {
      showError(error.message || 'Error converting trainee');
    }
  };

  return {
    showTraineeAccessModal,
    setShowTraineeAccessModal,
    activeTrainee,
    setActiveTrainee,
    showConvertToSubscriptionModal,
    setShowConvertToSubscriptionModal,
    traineeForConversion,
    setTraineeForConversion,
    handleManageSubscription,
    handleDeleteSubscription,
    handleDeleteTrainee,
    handleConvertToSubscription,
  };
}
