<script>
  import { navigate } from 'svelte-routing';

  let username = '';
  let password = '';
  let error = '';

  const register = async () => {
    error = '';

    // Frontend validation
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      error = 'Username must be 3-20 characters and contain only letters, numbers, and underscores.';
      return;
    }

    if (password.length < 6) {
      error = 'Password must be at least 6 characters long.';
      return;
    }

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        error = data.msg || 'An error occurred';
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
<form on:submit|preventDefault={register}>
  <input type="text" bind:value={username} placeholder="Username" required />
  <input type="password" bind:value={password} placeholder="Password" required />
  <button type="submit">Register</button>
</form>
