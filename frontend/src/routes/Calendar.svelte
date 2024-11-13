<script>

  let events = [];
  let error = '';
  let username = localStorage.getItem('username') || '';

  // Function to retrieve CSRF token from cookie
  const getCsrfToken = () => {
    const name = 'csrf_access_token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  };

  const csrfToken = getCsrfToken();

  // Fetch events from the API
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
      error = 'An error occurred while fetching events.';
    }
  };

  // Delete an event
  const deleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        },
      });
      const data = await response.json();
      if (response.ok) {
        // Remove the deleted event from the events array
        events = events.filter(event => event.id !== eventId);
      } else {
        alert(data.msg || 'Error deleting event');
      }
    } catch (err) {
      alert('An error occurred while deleting the event.');
    }
  };

  
  fetchEvents();

</script>


<div class="container">
  <h2>Your Events</h2>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}

  <a href="/event/new" class="add-event">Add New Event</a>

  <ul>
    {#each events as event}
      <li>
        <strong>{event.title}</strong> 
        <div>
          {new Date(event.start_time).toLocaleString()} - {new Date(event.end_time).toLocaleString()}
        </div>
        <div>Owner: {event.owner}</div>
        {#if event.shared_with && event.shared_with.length > 0}
          <div>Shared with: {event.shared_with.join(', ')}</div>
        {/if}
        
        <div class="button-group">
          {#if event.owner === username}
            <a href={`/event/${event.id}`} class="edit-button">Edit</a>
            <button on:click={() => deleteEvent(event.id)} class="delete-button">Delete</button>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
</div>

<style>
  /* Container Styling */
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  /* Header Styling */
  h2 {
    text-align: center;
    color: #333;
  }

  /* Error Message Styling */
  .error {
    background-color: #ffe6e6;
    color: #cc0000;
    padding: 10px;
    border: 1px solid #cc0000;
    border-radius: 5px;
    margin-bottom: 20px;
    text-align: center;
  }

  /* Add New Event Link Styling */
  .add-event {
    display: inline-block;
    margin-bottom: 20px;
    padding: 10px 15px;
    background-color: #28a745;
    color: #fff;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }

  .add-event:hover {
    background-color: #218838;
  }

  /* Event List Styling */
  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    background-color: #f8f9fa;
    margin-bottom: 15px;
    padding: 15px;
    border-radius: 5px;
    border: 1px solid #dee2e6;
    position: relative;
  }

  li strong {
    font-size: 1.2em;
    color: #343a40;
  }

  li div {
    margin-top: 5px;
    color: #6c757d;
  }

  /* Edit and Delete Buttons Styling */
  .button-group {
    position: absolute;
    top: 15px;
    right: 15px;
  }

  .button-group a,
  .button-group button {
    margin-left: 10px;
    padding: 5px 10px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    text-decoration: none;
    font-size: 0.9em;
  }

  .edit-button {
    background-color: #007bff;
    color: #fff;
    transition: background-color 0.3s ease;
  }

  .edit-button:hover {
    background-color: #0069d9;
  }

  .delete-button {
    background-color: #dc3545;
    color: #fff;
    transition: background-color 0.3s ease;
  }

  .delete-button:hover {
    background-color: #c82333;
  }

  /* Responsive Design */
  @media (max-width: 600px) {
    .button-group {
      position: static;
      margin-top: 10px;
    }

    .button-group a,
    .button-group button {
      margin-left: 0;
      margin-right: 10px;
    }
  }
</style>