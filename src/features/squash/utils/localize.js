export function pickLocalized(isAr, en, ar) {
  return isAr ? ar || en || '' : en || ar || '';
}

export function pickItemField(item, isAr, enKey, arKey) {
  if (!item) return '';
  return pickLocalized(isAr, item[enKey], item[arKey]);
}
