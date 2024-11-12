<script>
  import { navigate } from 'svelte-routing';
  import { isAuthenticated } from '../stores/auth';
  let username = '';
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    isAuthenticated.set(false);
    navigate('/login');
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
