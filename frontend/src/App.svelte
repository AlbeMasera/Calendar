<script>
  import { getContext } from 'svelte';
  import { Router, Route } from "svelte-routing";
  import Nav from './components/Nav.svelte';
  import Home from './routes/Home.svelte';
  import Login from './routes/Login.svelte';
  import Register from './routes/Register.svelte';
  import Calendar from './routes/Calendar.svelte';
  import Event from './routes/Event.svelte';

  const location = getContext("location");
</script>

<Nav />

<Router>
  <Route path="/">
    <Home />
  </Route>
  <Route path="/login">
    <Login />
  </Route>
  <Route path="/register">
    <Register />
  </Route>
  <Route path="/calendar">
    
      <Calendar />
  </Route>
  <Route path="/event/:id" let:params>
    <Event id={params.id} />
  </Route>
</Router>

<style>
  /* Add global styles here */
</style>
