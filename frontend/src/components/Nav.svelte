<!-- Navigation.svelte -->
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
      const c = ca[i].trim();
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  };


  $:username = localStorage.getItem('username') || '';

</script>

<style>
  /* Navigation Bar Styling */
  nav {
    background-color: #2c3e50; /* Dark Blue-Grey */
    padding: 0.75em 2em;
    display: flex;
    justify-content: center; /* Centers the nav content horizontally */
    align-items: center;    /* Centers the nav content vertically */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Container for Navigation Links */
  .nav-container {
    width: 100%;
    max-width: 1200px; /* Limits the maximum width for better readability */
    display: flex;
    justify-content: space-between; /* Spaces out the left and right sections */
    align-items: center;
  }

  /* Left Section (e.g., Home Link) */
  .nav-left {
    display: flex;
    align-items: center;
  }

  /* Right Section (Authenticated Links and User Info) */
  .nav-right {
    display: flex;
    align-items: center;
  }

  /* Navigation Links Styling */
  .nav-link {
    color: #ecf0f1; /* Light Grey */
    margin: 0 0.75em;
    text-decoration: none;
    font-size: 1em;
    transition: color 0.3s ease;
  }

  .nav-link:hover {
    color: #bdc3c7; /* Slightly Lighter Grey on Hover */
  }

  /* User Greeting Styling */
  .greeting {
    color: #ecf0f1;
    margin-right: 1em;
    font-size: 1em;
  }

  /* Logout Button Styling */
  .logout-button {
    background-color: #e74c3c; /* Vibrant Red */
    color: #ecf0f1;
    border: none;
    padding: 0.5em 1em;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
  }

  .logout-button:hover {
    background-color: #c0392b; /* Darker Red on Hover */
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    nav {
      padding: 0.75em 1em;
    }

    .nav-link {
      margin: 0 0.5em;
      font-size: 0.95em;
    }

    .greeting {
      font-size: 0.95em;
    }

    .logout-button {
      padding: 0.4em 0.8em;
      font-size: 0.95em;
    }
  }

  @media (max-width: 480px) {
    .nav-container {
      flex-direction: column;
    }

    .nav-left,
    .nav-right {
      flex-direction: column;
      align-items: center;
    }

    .nav-link {
      margin: 0.5em 0;
    }

    .greeting {
      margin: 0.5em 0;
    }

    .logout-button {
      width: 100%;
      text-align: center;
    }
  }
</style>

<nav>
  <div class="nav-container">
    <div class="nav-left">
      <a href="/" class="nav-link">Home</a>
    </div>
    <div class="nav-right">
      {#if $isAuthenticated}
        <a href="/calendar" class="nav-link">Calendar</a>
        <span class="greeting">Welcome, {username}!</span>
        <button class="logout-button" on:click={logout}>Logout</button>
      {:else}
        <a href="/login" class="nav-link">Login</a>
        <a href="/register" class="nav-link">Register</a>
      {/if}
    </div>
  </div>
</nav>
