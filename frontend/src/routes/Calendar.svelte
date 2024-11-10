<script>
  import { navigate } from 'svelte-routing';
  let events = [];
  let error = '';

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        events = data.events;
      } else {
        error = data.msg;
        if (response.status === 401) {
          navigate('/login');
        }
      }
    } catch (err) {
      error = 'An error occurred';
    }
  };

  fetchEvents();

  const addEvent = () => {
    navigate('/event/new');
  };

  const editEvent = (id) => {
    navigate(`/event/${id}`);
  };
</script>

<h2>Your Events</h2>
{#if error}
  <div class="error">{error}</div>
{/if}
<button on:click={addEvent}>Add New Event</button>
<ul>
  {#each events as event}
    <li>
      <strong>{event.title}</strong> ({event.start_time} - {event.end_time})
      <button on:click={() => editEvent(event.id)}>Edit</button>
    </li>
  {/each}
</ul>

<style>
  /* Add styles here */
</style>
