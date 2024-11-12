<script>
  let events = [];
  let error = '';
  let username = localStorage.getItem('username') || '';

  
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        },
      });
      const data = await response.json();
      if (response.ok) {
        events = data.events;
      } else {
        error = data.msg || 'Error fetching events';
        if (response.status === 401) {
          window.location.href = '/login';
        }
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


  const csrfToken = getCsrfToken();
    
  fetchEvents();
  
</script>

<h2>Your Events</h2>
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




