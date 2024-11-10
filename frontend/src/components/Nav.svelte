<script>
  import { navigate } from 'svelte-routing';
  let isAuthenticated = false;

  const logout = () => {
    localStorage.removeItem('token');
    isAuthenticated = false;
    navigate('/login');
  };

  $: isAuthenticated = localStorage.getItem('token') ? true : false;
</script>

<nav>
  <a href="/">Home</a>
  {#if isAuthenticated}
    <a href="/calendar">Calendar</a>
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
