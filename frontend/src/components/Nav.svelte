<script>
  import { navigate } from 'svelte-routing';
  import { isAuthenticated } from '../stores/auth';
  let username = '';

  const logout = async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
      });
      localStorage.removeItem('username');
      isAuthenticated.set(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

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
  $: username = localStorage.getItem('username') || ''; 
</script>

<nav>
  <a href="/">Home</a>
  {#if $isAuthenticated}
    <a href="/calendar">Calendar</a>
    <span>Welcome, {username}!</span> 
    <button on:click={logout}>Logout</button>
  {:else}
    <a href="/login">Login</a>
    <a href="/register">Register</a>
  {/if}
</nav>

<style>
  nav {
    background-color: #333;
    padding: 1em;
  }

  span {
    color: white;
    margin-right: 1em;
  }

  nav a {
    color: white;
    margin-right: 1em;
    text-decoration: none;
  }

  button {
    color: white;
    background: none;
    border: none;
    cursor: pointer;
  }
</style>
