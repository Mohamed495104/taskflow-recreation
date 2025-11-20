// Centralized configuration for API endpoints
// Use VITE_API_URL if available, otherwise fallback to the current active backend
export const API_ENDPOINT = import.meta.env.VITE_API_URL || 'https://taskflow-recreation-ldag.vercel.app/graphql';
