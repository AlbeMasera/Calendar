<style>
  /* Container Styling */
  .container {
    min-height: 100vh; /* Ensures the container takes up most of the viewport height */
    display: flex;
    flex-direction: column;
    justify-content: center; /* Centers content vertically */
    align-items: center;     /* Centers content horizontally */
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  /* Header Styling */
  h1 {
    font-size: 3em;
    color: #2c3e50; /* Dark Blue-Grey */
    margin-bottom: 0.5em;
    text-align: center;
  }

  /* Subheader Styling */
  p {
    font-size: 1.2em;
    color: #34495e; /* Slightly lighter dark blue-grey */
    max-width: 600px;
    text-align: center;
    margin-bottom: 1.5em;
  }

  /* Call-to-Action Button Styling */
  .cta-button {
    padding: 12px 25px;
    background-color: #007bff; /* Vibrant Blue */
    color: #ffffff;
    border: none;
    border-radius: 25px;
    font-size: 1em;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    text-decoration: none;
    display: inline-block;
  }

  .cta-button:hover {
    background-color: #0056b3; /* Darker Blue on Hover */
    transform: translateY(-2px); /* Slight lift effect */
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    h1 {
      font-size: 2.5em;
    }

    p {
      font-size: 1em;
      max-width: 90%;
    }

    .cta-button {
      padding: 10px 20px;
      font-size: 0.95em;
    }
  }

  @media (max-width: 480px) {
    h1 {
      font-size: 2em;
    }

    p {
      font-size: 0.95em;
    }

    .cta-button {
      padding: 8px 16px;
      font-size: 0.9em;
    }
  }
</style>

<div class="container">
  <h1>Welcome to the Calendar Application</h1>

  <a href="/register" class="cta-button">Get Started</a>
</div>
