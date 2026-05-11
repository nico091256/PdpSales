/**
 * Unit tests for shared/lib/validation.ts
 *
 * Each test covers both the happy path and boundary/edge cases so that
 * regressions in validation logic are caught immediately.
 */

import { describe, expect, it } from 'vitest';
import {
  validatePassword,
  validateEmail,
  validateCompanySlug,
  validateImageFile,
} from '@shared/lib/validation';

// ── validatePassword ─────────────────────────────────────────────────────────
describe('validatePassword', () => {
  it('returns null for a strong password', () => {
    expect(validatePassword('Secure123')).toBeNull();
    expect(validatePassword('MyP@ss99Word')).toBeNull();
  });

  it('rejects passwords shorter than 8 characters', () => {
    expect(validatePassword('Ab1')).not.toBeNull();
    expect(validatePassword('Short1')).not.toBeNull();
  });

  it('rejects passwords with no uppercase letter', () => {
    expect(validatePassword('alllower1')).not.toBeNull();
  });

  it('rejects passwords with no digit', () => {
    expect(validatePassword('NoDigitsHere')).not.toBeNull();
  });

  it('rejects an empty string', () => {
    expect(validatePassword('')).not.toBeNull();
  });
});

// ── validateEmail ─────────────────────────────────────────────────────────────
describe('validateEmail', () => {
  it('returns null for valid emails', () => {
    expect(validateEmail('user@example.com')).toBeNull();
    expect(validateEmail('first.last+tag@sub.domain.org')).toBeNull();
  });

  it('rejects emails without @', () => {
    expect(validateEmail('notanemail')).not.toBeNull();
  });

  it('rejects emails without a domain', () => {
    expect(validateEmail('user@')).not.toBeNull();
  });

  it('rejects emails with spaces', () => {
    expect(validateEmail('user @example.com')).not.toBeNull();
  });
});

// ── validateCompanySlug ───────────────────────────────────────────────────────
describe('validateCompanySlug', () => {
  it('returns null for an empty string (optional field)', () => {
    expect(validateCompanySlug('')).toBeNull();
  });

  it('returns null for valid slugs', () => {
    expect(validateCompanySlug('acme-corp')).toBeNull();
    expect(validateCompanySlug('my-company-123')).toBeNull();
  });

  it('rejects slugs with uppercase letters', () => {
    expect(validateCompanySlug('AcmeCorp')).not.toBeNull();
  });

  it('rejects slugs shorter than 2 characters', () => {
    expect(validateCompanySlug('a')).not.toBeNull();
  });

  it('rejects slugs with spaces or special characters', () => {
    expect(validateCompanySlug('my company')).not.toBeNull();
    expect(validateCompanySlug('my_company!')).not.toBeNull();
  });
});

// ── validateImageFile ─────────────────────────────────────────────────────────
describe('validateImageFile', () => {
  function makeFile(type: string, sizeBytes: number): File {
    const content = new Uint8Array(sizeBytes);
    return new File([content], 'test.img', { type });
  }

  it('accepts valid JPEG under size limit', () => {
    const file = makeFile('image/jpeg', 1024);
    expect(validateImageFile(file)).toBeNull();
  });

  it('accepts valid PNG, WebP, and GIF', () => {
    expect(validateImageFile(makeFile('image/png', 1024))).toBeNull();
    expect(validateImageFile(makeFile('image/webp', 1024))).toBeNull();
    expect(validateImageFile(makeFile('image/gif', 1024))).toBeNull();
  });

  it('rejects disallowed MIME types', () => {
    expect(validateImageFile(makeFile('application/pdf', 1024))).not.toBeNull();
    expect(validateImageFile(makeFile('image/svg+xml', 1024))).not.toBeNull();
    expect(validateImageFile(makeFile('video/mp4', 1024))).not.toBeNull();
  });

  it('rejects files exceeding 5 MB', () => {
    const over5MB = 5 * 1024 * 1024 + 1;
    expect(validateImageFile(makeFile('image/jpeg', over5MB))).not.toBeNull();
  });

  it('accepts a file at exactly 5 MB', () => {
    const exactly5MB = 5 * 1024 * 1024;
    expect(validateImageFile(makeFile('image/jpeg', exactly5MB))).toBeNull();
  });
});
