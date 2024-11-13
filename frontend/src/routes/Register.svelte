<!-- Register.svelte -->
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
        window.location.reload();

      } else {
        error = data.msg || 'An error occurred';
      }
    } catch (err) {
      error = 'An error occurred';
    }
  };
</script>

<style>
  /* Container Styling */
  .container {
    max-width: 400px;
    margin: 60px auto;
    padding: 30px 40px;
    background-color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  /* Header Styling */
  h2 {
    text-align: center;
    color: #333333;
    margin-bottom: 25px;
    font-size: 1.8em;
  }

  /* Error Message Styling */
  .error {
    background-color: #ffe6e6;
    color: #cc0000;
    padding: 12px 20px;
    border: 1px solid #cc0000;
    border-radius: 5px;
    margin-bottom: 20px;
    text-align: center;
    font-weight: bold;
  }

  /* Form Styling */
  form {
    display: flex;
    flex-direction: column;
  }

  /* Input Fields Styling */
  input[type="text"],
  input[type="password"] {
    padding: 12px 15px;
    margin-bottom: 20px;
    border: 1px solid #cccccc;
    border-radius: 4px;
    font-size: 1em;
    transition: border-color 0.3s ease;
  }

  input[type="text"]:focus,
  input[type="password"]:focus {
    border-color: #007bff;
    outline: none;
  }

  /* Submit Button Styling */
  button[type="submit"] {
    padding: 12px 20px;
    background-color: #007bff;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    font-size: 1em;
    cursor: pointer;
    transition: background-color 0.3s ease;
    font-weight: bold;
  }

  button[type="submit"]:hover {
    background-color: #0056b3;
  }

  /* Informational Text Styling */
  .info-text {
    font-size: 0.9em;
    color: #555555;
    margin-top: 15px;
    text-align: center;
  }

  /* Responsive Design */
  @media (max-width: 500px) {
    .container {
      margin: 30px 20px;
      padding: 25px 20px;
    }

    h2 {
      font-size: 1.5em;
    }

    button[type="submit"] {
      padding: 10px 15px;
    }
  }
</style>

<div class="container">
  <h2>Register</h2>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  <form on:submit|preventDefault={register}>
    <!-- Username Input -->
    <input 
      type="text" 
      bind:value={username} 
      placeholder="Username" 
      required 
      aria-label="Username"
    />
    
    <!-- Password Input -->
    <input 
      type="password" 
      bind:value={password} 
      placeholder="Password" 
      required 
      aria-label="Password"
    />
    
    <!-- Submit Button -->
    <button type="submit">Register</button>
  </form>
  
  <!-- Informational Text -->
  <div class="info-text">
    Username must be 3-20 characters and contain only letters, numbers, and underscores. Password must be at least 6 characters long.
  </div>
</div>
