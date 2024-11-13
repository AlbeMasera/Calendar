# Calendar App Frontend

This is the frontend part of the Calendar App, built with Svelte and bundled using Rollup.

## Tech Stack

- **Svelte** with **Svelte Routing**
- **Rollup** for bundling

## Project Structure

```plaintext
frontend/
├── public/                 # Public assets and build output
│   ├── build/              # Compiled assets
│   ├── favicon.ico         # Favicon
│   ├── index.html          # Main HTML file
├── src/                    # Svelte source files
│   ├── App.svelte          # Root Svelte component
│   ├── main.js             # Entry point for Svelte application
│   ├── components/         # Reusable components (e.g., Navbar, Autocomplete)
│   ├── routes/             # Route views (e.g., Home, Login, Register, Calendar)
│   └── stores/             # Svelte stores for state management (e.g., auth)
├── .gitignore              # Git ignore file
├── Dockerfile              # Dockerfile for frontend
├── jsconfig.json           # JavaScript configuration
├── package.json            # NPM package configuration
├── README.md               # Frontend documentation
├── rollup.config.js        # Rollup configuration
├── svelte.config.cjs       # Svelte configuration
└── vite.config.js          # Vite configuration



```
