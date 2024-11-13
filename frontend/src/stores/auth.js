import { writable } from 'svelte/store';

const getCsrfToken = () => {
    // Function to retrieve CSRF token from cookie
    const name = 'csrf_access_token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      if (ca[i].trim().indexOf(name) == 0) {
        return ca[i].trim().substring(name.length, ca[i].trim().length);
      }
    }
    return '';
  };

export const isAuthenticated = writable(getCsrfToken()!=='');