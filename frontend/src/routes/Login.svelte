<script>
  import { navigate } from 'svelte-routing';
  import { isAuthenticated } from '../stores/auth';
  let username = '';
  let password = '';
  let error = '';

  const login = async () => {
    error = '';
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        credentials: 'include',  
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        username = data.username;
        localStorage.setItem('username', username);
        isAuthenticated.set(true);

        navigate('/calendar');
        
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

  /* Register Link Styling */
  .register-link {
    text-align: center;
    margin-top: 15px;
    font-size: 0.9em;
    color: #555555;
  }

  .register-link a {
    color: #007bff;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .register-link a:hover {
    color: #0056b3;
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
  <h2>Login</h2>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  <form on:submit|preventDefault={login}>
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
    <button type="submit">Login</button>
  </form>
  
  <!-- Register Link -->
  <div class="register-link">
    Don't have an account? <a href="/register">Register here</a>
  </div>
</div>
