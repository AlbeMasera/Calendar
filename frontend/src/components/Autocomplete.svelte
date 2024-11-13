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
      if (ca[i].trim().indexOf(name) === 0) {
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

<div class="autocomplete-wrapper">
  <label for="user-input" class="autocomplete-label">Share with:</label>
  
  <div class="selected-items">
    {#each selectedItems as item}
      <span class="tag">
        {item}
        <button type="button" class="remove-button" on:click={() => removeItem(item)} aria-label={`Remove ${item}`}>
          &times;
        </button>
      </span>
    {/each}
  </div>
  
  <input
    id="user-input"
    type="text"
    bind:value={query}
    on:input={() => fetchSuggestions()}
    placeholder="Type username"
    class="input-field"
    aria-autocomplete="list"
    aria-controls="suggestions-list"
    aria-expanded={suggestions.length > 0}
    role="combobox"
  />
  
  {#if suggestions.length > 0}
    <ul id="suggestions-list" class="suggestions" role="listbox">
      {#each suggestions as suggestion}
        <li role="option" aria-selected="false">
          <button type="button" class="suggestion-item" on:click={() => addItem(suggestion)}>
            {suggestion}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  /* Container Styling */
  .autocomplete-wrapper {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: 0 auto; /* Centers the component horizontally */
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  /* Label Styling */
  .autocomplete-label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #333333;
    font-size: 1em;
  }

  /* Selected Items Container */
  .selected-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
  }

  /* Tag Styling */
  .tag {
    background-color: #007bff;
    color: #ffffff;
    padding: 6px 10px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    font-size: 0.9em;
  }

  /* Remove Button Styling */
  .remove-button {
    background: none;
    border: none;
    color: #ffffff;
    margin-left: 6px;
    cursor: pointer;
    font-size: 1em;
    line-height: 1;
  }

  .remove-button:hover {
    color: #cccccc;
  }

  /* Input Field Styling */
  .input-field {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #cccccc;
    border-radius: 4px;
    font-size: 1em;
    transition: border-color 0.3s ease;
  }

  .input-field:focus {
    border-color: #007bff;
    outline: none;
  }

  /* Suggestions List Styling */
  .suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #ffffff;
    border: 1px solid #cccccc;
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
    list-style: none;
    padding: 0;
    margin: 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  /* Suggestion Item Styling */
  .suggestion-item {
    width: 100%;
    padding: 10px 12px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.2s ease;
  }

  .suggestion-item:hover {
    background-color: #f0f0f0;
  }

  /* Scrollbar Styling (Webkit Browsers) */
  .suggestions::-webkit-scrollbar {
    width: 6px;
  }

  .suggestions::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .suggestions::-webkit-scrollbar-thumb {
    background-color: #cccccc;
    border-radius: 3px;
  }

  /* Responsive Design */
  @media (max-width: 480px) {
    .autocomplete-wrapper {
      max-width: 100%;
      padding: 0 10px;
    }

    .tag {
      font-size: 0.8em;
      padding: 5px 8px;
    }

    .input-field {
      padding: 8px 10px;
      font-size: 0.95em;
    }

    .suggestion-item {
      padding: 8px 10px;
      font-size: 0.95em;
    }
  }
</style>
