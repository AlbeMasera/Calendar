<script>
  import { navigate } from 'svelte-routing';
  let username = '';
  let password = '';
  let error = '';

  const login = async () => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        navigate('/calendar');
      } else {
        error = data.msg;
      }
    } catch (err) {
      error = 'An error occurred';
    }
  };
</script>

<h2>Login</h2>
{#if error}
  <div class="error">{error}</div>
{/if}
<form on:submit|preventDefault={login}>
  <input type="text" bind:value={username} placeholder="Username" required />
  <input type="password" bind:value={password} placeholder="Password" required />
  <button type="submit">Login</button>
</form>

<style>
  /* Add styles here */
</style>
