<script>
  console.log('Calendar component is rendering');

  let events = [];
  let error = '';
  let username = localStorage.getItem('username');

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Stored Token:', token);
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log('Response Status:', response.status);
      console.log('Fetched Data:', data);
      if (response.ok) {
        events = data.events;
        console.log('Events:', events);
      } else {
        error = data.msg || 'Error fetching events';
        console.error('Error:', error);
        if (response.status === 401) {
          console.log('Unauthorized');
          window.location.href = '/login';
        }
      }
    } catch (err) {
      error = 'An error occurred';
      console.error('Fetch Error:', err);
    }
  };


    
  fetchEvents();
  
</script>

<h2>Your Events!</h2>
{#if error}
  <div class="error">{error}</div>
{/if}


<a href="/event/new">Add New Event</a>

<ul>
  {#each events as event}
    <li>
      <strong>{event.title}</strong> ({new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()})
      <div>Owner: {event.owner}</div>
      {#if event.shared_with && event.shared_with.length > 0}
        <div>Shared with: {event.shared_with.join(', ')}</div>
      {/if}
      {#if event.owner === username}
        <a href={`/event/${event.id}`}>Edit</a>
      {/if}
    </li>
  {/each}
</ul>




