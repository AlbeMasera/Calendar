<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import Autocomplete from '../components/Autocomplete.svelte'; // New component
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
        error = 'An error occurred';
      }
    }
  });

  const saveEvent = async () => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({ title, description, start_time, end_time, shared_with }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/calendar');
      } else {
        error = data.msg || 'An error occurred';
      }
    } catch (err) {
      error = 'An error occurred';
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

<h2>{isEditing ? 'Edit' : 'New'} Event</h2>
{#if error}
  <div class="error">{error}</div>
{/if}
<form on:submit|preventDefault={saveEvent}>
  <input type="text" bind:value={title} placeholder="Title" required />
  <textarea bind:value={description} placeholder="Description"></textarea>
  <input type="datetime-local" bind:value={start_time} required />
  <input type="datetime-local" bind:value={end_time} required />

  <!-- Autocomplete Component for Sharing -->
  <Autocomplete bind:selectedItems={shared_with} />

  <button type="submit">Save</button>
</form>