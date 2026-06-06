import { describe, it, expect } from 'vitest';
import { PROXY_MAX_BYTES, resolveUploadMethod } from './uploadStrategy';

describe('resolveUploadMethod', () => {
  it('uses presign for files larger than proxy limit even when API proxy is enabled', () => {
    expect(resolveUploadMethod(PROXY_MAX_BYTES + 1, true)).toBe('presign');
    expect(resolveUploadMethod(50 * 1024 * 1024, true)).toBe('presign');
  });

  it('uses proxy for small files when API proxy is enabled', () => {
    expect(resolveUploadMethod(PROXY_MAX_BYTES, true)).toBe('proxy');
    expect(resolveUploadMethod(1024, true)).toBe('proxy');
  });

  it('uses presign for small files when API proxy is disabled', () => {
    expect(resolveUploadMethod(1024, false)).toBe('presign');
    expect(resolveUploadMethod(PROXY_MAX_BYTES, false)).toBe('presign');
  });
});
