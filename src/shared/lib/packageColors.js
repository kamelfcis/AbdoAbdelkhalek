/**
 * Derive tier gradient colors from package name (shared by fitness & squash landing cards).
 */
export function resolvePackageColor(pkg) {
  const nameEn = (pkg.name_en || '').toLowerCase();
  const nameAr = (pkg.name_ar || '').toLowerCase();
  const isGold = nameEn.includes('gold') || nameAr.includes('ذهبي') || nameAr.includes('جولد');
  const hasPro = nameAr.includes('برو') || nameEn.includes('pro');
  const isGoldWithNutritionOrTraining =
    isGold &&
    !hasPro &&
    (nameAr.includes('تغذيه') ||
      nameAr.includes('تغذية') ||
      nameAr.includes('تمرين') ||
      nameEn.includes('nutrition') ||
      nameEn.includes('training'));

  if (isGoldWithNutritionOrTraining) {
    return {
      gradientFrom: 'var(--color-primary-light)',
      gradientTo: 'var(--color-primary)',
      solid: 'var(--color-primary)',
      text: 'text-white',
    };
  }
  if (isGold) {
    return {
      gradientFrom: 'rgb(244, 215, 123)',
      gradientTo: 'rgb(220, 180, 80)',
      solid: 'rgb(244, 215, 123)',
      text: 'text-[var(--color-text)]',
    };
  }
  if (nameEn.includes('platinum') || nameAr.includes('بلاتيني') || nameAr.includes('بلاتينوم')) {
    return {
      gradientFrom: 'rgb(157 137 255)',
      gradientTo: 'hsl(250, 73.70%, 70.20%)',
      solid: 'rgb(157 137 255)',
      text: 'text-white',
    };
  }
  return {
    gradientFrom: 'var(--color-primary-light)',
    gradientTo: 'var(--color-primary)',
    solid: 'var(--color-primary)',
    text: 'text-white',
  };
}

export function buildPackageColorMap(packages) {
  const colorsMap = new Map();
  packages.forEach((pkg) => colorsMap.set(pkg.id, resolvePackageColor(pkg)));
  return colorsMap;
}

export function isPlatinumPackage(pkg, packageColor) {
  const nameEn = (pkg.name_en || '').toLowerCase();
  const nameAr = (pkg.name_ar || '').toLowerCase();
  return (
    packageColor.text === 'text-white' &&
    (nameEn.includes('platinum') || nameAr.includes('بلاتيني') || nameAr.includes('بلاتينوم'))
  );
}
