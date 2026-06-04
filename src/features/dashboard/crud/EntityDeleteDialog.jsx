import { showConfirm } from '../../../shared/lib/notifications';

/** Confirm-then-delete helper used by useEntityCrud. */
export async function confirmEntityDelete({ isAr, message }) {
  return showConfirm(
    isAr ? 'هل أنت متأكد؟' : 'Are you sure?',
    message || (isAr ? 'سيتم الحذف نهائياً' : 'This item will be deleted'),
    isAr ? 'نعم، احذف' : 'Yes, delete',
    isAr ? 'إلغاء' : 'Cancel'
  );
}
