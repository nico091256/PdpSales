/**
 * Shared validation utilities.
 *
 * WHY: Password rules were inconsistently applied (min 6 chars, no complexity).
 * For a B2B SaaS application this is too weak. Centralized here so all auth
 * forms enforce the same rules.
 *
 * Phone and slug validation added to prevent garbage data reaching the API.
 */

/** Validate a password. Returns null if valid, an error message if invalid. */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
}

/** Validate an email address with a practical regex. */
export function validateEmail(email: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Enter a valid email address';
  }
  return null;
}

/**
 * Validate a company slug (alphanumeric + hyphens, 2–60 chars).
 * Returns null if valid or if the field is empty (slug is optional on login).
 */
export function validateCompanySlug(slug: string): string | null {
  if (!slug) return null; // optional field
  if (!/^[a-zA-Z0-9-]{2,60}$/.test(slug)) {
    return 'Slug must be 2-60 letters, numbers, or hyphens';
  }
  return null;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/** Validate an uploaded image file. Returns null if valid, error message if not. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Only JPEG, PNG, WebP, and GIF images are allowed';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'File size must be less than 5 MB';
  }
  return null;
}
