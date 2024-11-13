<script>
  import { Router, Route } from "svelte-routing";
  import Nav from './components/Nav.svelte';
  import Home from './routes/Home.svelte';
  import Login from './routes/Login.svelte';
  import Register from './routes/Register.svelte';
  import Calendar from './routes/Calendar.svelte';
  import Event from './routes/Event.svelte';

  let location = '';
  $: location = window.location.pathname;
</script>

<Nav />

<Router>
  <Route path="/">
    {#key location}
    <Home />
    {/key}
  </Route>
  <Route path="/login">
    {#key location}
      <Login />
    {/key}
  </Route>
  <Route path="/register">
    {#key location}
      <Register />
    {/key}
  </Route>
  <Route path="/calendar">
    {#key location}
      <Calendar />
    {/key}
  </Route>
  <Route path="/event/:id" let:params>
    <Event id={params.id} />
  </Route>
</Router>

<style>
  /* Add global styles here */
</style>
