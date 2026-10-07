/**
 * Sanitizes email input to prevent injection attacks
 * @param {string} email - The email to sanitize
 * @returns {string} - The sanitized email
 */
export function sanitizeEmail(email) {
  if (!email) return '';

  // Trim whitespace
  let sanitized = email.trim();

  // Remove potentially dangerous characters
  // This is a basic sanitization - for production, consider using a library like validator.js
  sanitized = sanitized.replace(/[<>\"'\\\/\{\}\[\]\(\)]/g, '');

  // Limit length to prevent DoS via extremely long emails
  if (sanitized.length > 254) {
    // RFC 5321 limit for email length
    sanitized = sanitized.substring(0, 254);
  }

  return sanitized;
}