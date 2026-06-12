import { describe, expect, it } from 'vitest';
import { formatPrice } from './currency';

describe('formatPrice', () => {
  it('renders EGP and USD rows with flags', () => {
    const html = formatPrice(1500, 50);
    expect(html).toContain('simple-currency-display');
    expect(html).toContain('currency-flag-simple');
    expect(html).toContain('flagcdn.com/w40/eg.png');
    expect(html).toContain('flagcdn.com/w40/us.png');
    expect(html).toContain('EGP');
    expect(html).toContain('USD');
    expect(html).toContain('1,500');
    expect(html).toContain('50');
  });

  it('returns dash when no prices', () => {
    expect(formatPrice(null, null)).toBe('<span>—</span>');
  });
});
