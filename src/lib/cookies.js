/**
 * Cookie Helper Utilities for Productify
 * Handles session cookies with 24-hour expiration and cookie consent state.
 */

export const SESSION_COOKIE_NAME = 'productify_session';
export const LOGIN_TIME_COOKIE_NAME = 'productify_login_time';
export const CONSENT_COOKIE_NAME = 'productify_cookie_consent';

// 24 Hours in seconds (86,400 seconds)
export const SESSION_DURATION_SECONDS = 24 * 60 * 60;

/**
 * Set a cookie with expiration in seconds
 */
export function setCookie(name, value, seconds = SESSION_DURATION_SECONDS) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + seconds * 1000).toUTCString();
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; max-age=${seconds}; path=/; SameSite=Lax${secureFlag}`;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const nameEQ = encodeURIComponent(name) + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name) {
  if (typeof document === 'undefined') return;
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/; SameSite=Lax${secureFlag}`;
}

/**
 * Store user session in cookie with 24-hour duration (86,400 seconds)
 */
export function setSessionCookie(profileId, durationSeconds = SESSION_DURATION_SECONDS) {
  if (!profileId) return;
  const loginTimestamp = Date.now().toString();
  setCookie(SESSION_COOKIE_NAME, profileId, durationSeconds);
  setCookie(LOGIN_TIME_COOKIE_NAME, loginTimestamp, durationSeconds);
}

/**
 * Check if active session cookie exists and is within 24 hours
 */
export function hasValidSessionCookie() {
  const sessionVal = getCookie(SESSION_COOKIE_NAME);
  const loginTimeStr = getCookie(LOGIN_TIME_COOKIE_NAME);

  if (!sessionVal || !loginTimeStr) {
    return false;
  }

  const loginTime = parseInt(loginTimeStr, 10);
  if (isNaN(loginTime)) {
    return false;
  }

  const maxAgeMs = SESSION_DURATION_SECONDS * 1000;
  const isWithin24Hours = (Date.now() - loginTime) < maxAgeMs;

  return isWithin24Hours;
}

/**
 * Clear session cookies
 */
export function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE_NAME);
  deleteCookie(LOGIN_TIME_COOKIE_NAME);
}

/**
 * Get Cookie Consent preference
 */
export function getCookieConsent() {
  const cookieVal = getCookie(CONSENT_COOKIE_NAME);
  if (cookieVal) return cookieVal;
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(CONSENT_COOKIE_NAME);
  }
  return null;
}

/**
 * Save Cookie Consent preference (1 year expiration)
 */
export function setCookieConsent(value = 'accepted') {
  const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;
  setCookie(CONSENT_COOKIE_NAME, value, ONE_YEAR_SECONDS);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CONSENT_COOKIE_NAME, value);
  }
}
