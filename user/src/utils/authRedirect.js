import { isAuthenticated } from '../services/authService'

/**
 * Check if user should be redirected based on authentication status
 * @param {string} path - Current path
 * @returns {string|null} - Redirect path or null
 */
export const getAuthRedirect = (path) => {
  const authenticated = isAuthenticated()

  // If user is authenticated and trying to access login/signup, redirect to home
  if (authenticated && (path === '/login' || path === '/signup')) {
    return '/home'
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!authenticated && ['/home', '/donate'].includes(path)) {
    return '/login'
  }

  return null
}

/**
 * Handle authentication redirect logic
 * @param {string} currentPath - Current pathname
 * @param {Function} navigate - React Router navigate function
 */
export const handleAuthRedirect = (currentPath, navigate) => {
  const redirectPath = getAuthRedirect(currentPath)
  if (redirectPath) {
    navigate(redirectPath, { replace: true })
  }
}

