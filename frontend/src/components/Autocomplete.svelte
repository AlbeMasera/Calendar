<script>
  import { onMount } from 'svelte';
import debounce from 'lodash/debounce';
  export let selectedItems = []; // Bound to parent component
  let suggestions = [];
  let query = '';

  const fetchSuggestions = debounce(async () => {
    if (query.length < 1) {
      suggestions = [];
      return;
    }
    try {
      const response = await fetch(`/api/users?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        suggestions = data.users.filter(user => !selectedItems.includes(user));
      }
    } catch (err) {
      // Handle error
    }
  }, 300);

  const addItem = async (item) => {
    try {
      const response = await fetch(`/api/users?q=${encodeURIComponent(item)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.users.includes(item)) {
        selectedItems = [...selectedItems, item];
        suggestions = [];
        query = '';
      } else {
        // Show an error or feedback that the user does not exist
        alert(`User "${item}" does not exist.`);
      }
    } catch (err) {
      // Handle error
    }
  };

  const removeItem = (item) => {
    selectedItems = selectedItems.filter(i => i !== item);
  };
</script>

<div>
  <label  for="user-input">Share with:</label>
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
