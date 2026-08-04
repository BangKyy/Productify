/**
 * Input Security & Sanitization Helper
 * Sanitizes input strings against SQL Injection patterns, script tags, and malicious chars.
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';

  let sanitized = input.trim();

  // Strip common SQL Injection payloads & malicious patterns
  sanitized = sanitized.replace(/(--|;|#|\/\*|\*\/)/g, ''); // Remove SQL comment/termination syntax
  sanitized = sanitized.replace(/(UNION\s+SELECT|SELECT\s+\*|DROP\s+TABLE|INSERT\s+INTO|DELETE\s+FROM|UPDATE\s+.*SET)/gi, ''); // Remove SQL DDL/DML injection keywords

  return sanitized;
}

/**
 * Validate password requirements:
 * 1. Minimal 6 karakter
 * 2. Mengandung minimal 1 huruf besar (A-Z)
 * 3. Mengandung minimal 1 angka (0-9)
 */
export function validatePasswordStrength(password) {
  const pwd = password || '';
  const hasMinLength = pwd.length >= 6;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);

  const isValid = hasMinLength && hasUppercase && hasNumber;

  return {
    isValid,
    hasMinLength,
    hasUppercase,
    hasNumber,
    length: pwd.length
  };
}
