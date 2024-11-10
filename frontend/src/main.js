import App from './App.svelte';

const app = new App({
  target: document.getElementById('app'),
  // hydrate: true, // Remove or set to false if not using hydration
});

export default app;
