export const GOOGLE_MAPS_API_KEY = 'AIzaSyBmWoyHtrxYaF631bZCzGFr_NB8r3SyOvE';

// Use environment variable for API URL, with dynamic fallback for production
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = isDevelopment 
    ? 'http://localhost:8000'
    : 'https://backend-production-af9c.up.railway.app'; // Replace with your actual Railway service URL
