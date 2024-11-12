<script>
  import debounce from 'lodash/debounce';
  export let selectedItems = []; // Bound to parent component
  let suggestions = [];
  let query = '';


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

  const fetchSuggestions = debounce(async () => {
    if (query.length < 1) {
      suggestions = [];
      return;
    }
    try {
      const csrfToken = getCsrfToken();
      const response = await fetch(`/api/users?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        },
      });
      const data = await response.json();
      if (response.ok) {
        suggestions = data.users.filter(user => !selectedItems.includes(user));
      } else {
        console.error('Error fetching suggestions:', data.msg);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, 300);

  const addItem = async (item) => {
    try {
      const response = await fetch(`/api/users?q=${encodeURIComponent(item)}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.users.includes(item)) {
        selectedItems = [...selectedItems, item];
        suggestions = [];
        query = '';
      } else {
        alert(`User "${item}" does not exist.`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const removeItem = (item) => {
    selectedItems = selectedItems.filter(i => i !== item);
  };
</script>

<div>
  <label for="user-input">Share with:</label>
  <div>
    {#each selectedItems as item}
      <span>{item} <button on:click={() => removeItem(item)}>x</button></span>
    {/each}
  </div>
  <input
    type="text"
    bind:value={query}
    on:input={(event) => fetchSuggestions(event)}
    placeholder="Type username"
  />
  {#if suggestions.length > 0}
    <ul>
      {#each suggestions as suggestion}
        <li><button type="button" on:click={() => addItem(suggestion)}>{suggestion}</button></li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  /* Add styles for better UI */
</style>
