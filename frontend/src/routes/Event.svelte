<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  export let id;
  let title = '';
  let description = '';
  let start_time = '';
  let end_time = '';
  let error = '';
  let isEditing = false;

  onMount(async () => {
    if (id !== 'new') {
      isEditing = true;
      try {
        const response = await fetch(`/api/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          title = data.title;
          description = data.description;
          start_time = data.start_time;
          end_time = data.end_time;
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
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/events/${id}` : '/api/events';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title, description, start_time, end_time }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/calendar');
      } else {
        error = data.msg;
      }
    } catch (err) {
      error = 'An error occurred';
    }
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
  <button type="submit">Save</button>
</form>

<style>
  /* Add styles here */
</style>
