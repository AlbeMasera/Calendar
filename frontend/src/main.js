import App from './App.svelte';

const app = new App({
  target: document.getElementById('app') // Ensure 'app' matches the ID in your index.html
});

export default app;