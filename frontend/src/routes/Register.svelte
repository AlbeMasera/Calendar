<script>
  import { navigate } from 'svelte-routing';
  let username = '';
  let password = '';
  let error = '';
  let success = '';

  const register = async () => {
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        success = data.msg;
        navigate('/login');
      } else {
        error = data.msg;
      }
    } catch (err) {
      error = 'An error occurred';
    }
  };
</script>

<h2>Register</h2>
{#if error}
  <div class="error">{error}</div>
{/if}
{#if success}
  <div class="success">{success}</div>
{/if}
<form on:submit|preventDefault={register}>
  <input type="text" bind:value={username} placeholder="Username" required />
  <input type="password" bind:value={password} placeholder="Password" required />
  <button type="submit">Register</button>
</form>

<style>
  /* Add styles here */
</style>
