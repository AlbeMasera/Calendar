<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import Autocomplete from '../components/Autocomplete.svelte'; // Ensure this component is styled appropriately
  export let id;
  let title = '';
  let description = '';
  let start_time = '';
  let end_time = '';
  let shared_with = []; // Array of usernames
  let error = '';
  let isEditing = false;

  onMount(async () => {
    if (id !== 'new') {
      isEditing = true;
      try {
        const response = await fetch(`/api/events/${id}`, {
          credentials: 'include', // Use cookies for authentication
          headers: {
            'X-CSRF-TOKEN': getCsrfToken(), // CSRF token from cookie
          },
        });
        const data = await response.json();
        if (response.ok) {
          title = data.title;
          description = data.description;
          start_time = data.start_time.slice(0, 16);
          end_time = data.end_time.slice(0, 16);
          shared_with = data.shared_with;
        } else {
          error = data.msg;
        }
      } catch (err) {
        error = 'An error occurred while fetching the event.';
      }
    }
  });

  const saveEvent = async () => {
    try {
      const response = await fetch('/api/events', {
        method: isEditing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({ id, title, description, start_time, end_time, shared_with }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/calendar');
      } else {
        error = data.msg || 'An error occurred while saving the event.';
      }
    } catch (err) {
      error = 'An error occurred while saving the event.';
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
</script>

<style>
  /* Container Styling */
  .container {
    max-width: 600px;
    margin: 40px auto;
    padding: 30px;
    background-color: #ffffff;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  /* Header Styling */
  h2 {
    text-align: center;
    color: #333333;
    margin-bottom: 20px;
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
  input[type="datetime-local"],
  textarea {
    padding: 12px 15px;
    margin-bottom: 15px;
    border: 1px solid #cccccc;
    border-radius: 4px;
    font-size: 1em;
    transition: border-color 0.3s ease;
  }

  input[type="text"]:focus,
  input[type="datetime-local"]:focus,
  textarea:focus {
    border-color: #007bff;
    outline: none;
  }

  /* Textarea Specific Styling */
  textarea {
    resize: vertical;
    min-height: 100px;
  }

  /* Autocomplete Component Styling */
  .autocomplete-container {
    margin-bottom: 15px;
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
    align-self: flex-end;
  }

  button[type="submit"]:hover {
    background-color: #0056b3;
  }

  /* Responsive Design */
  @media (max-width: 600px) {
    .container {
      margin: 20px;
      padding: 20px;
    }

    h2 {
      font-size: 1.5em;
    }

    button[type="submit"] {
      width: 100%;
      align-self: center;
    }
  }
</style>

<div class="container">
  <h2>{isEditing ? 'Edit' : 'New'} Event</h2>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
  <form on:submit|preventDefault={saveEvent}>
    <!-- Title Input -->
    <input 
      type="text" 
      bind:value={title} 
      placeholder="Event Title" 
      required 
      aria-label="Event Title"
    />
    
    <!-- Description Textarea -->
    <textarea 
      bind:value={description} 
      placeholder="Event Description" 
      aria-label="Event Description"
    ></textarea>
    
    <!-- Start Time Input -->
    <input 
      type="datetime-local" 
      bind:value={start_time} 
      required 
      aria-label="Start Time"
    />
    
    <!-- End Time Input -->
    <input 
      type="datetime-local" 
      bind:value={end_time} 
      required 
      aria-label="End Time"
    />
    
    <!-- Autocomplete Component for Sharing -->
    <div class="autocomplete-container">
      <Autocomplete bind:selectedItems={shared_with} />
    </div>
    
    <!-- Save Button -->
    <button type="submit">{isEditing ? 'Update' : 'Create'} Event</button>
  </form>
</div>
