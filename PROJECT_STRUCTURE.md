# Portfolio Project Structure

## Overview
A React-based portfolio website featuring a clean, modern design with a retractable sidebar navigation and integrated projects.

## Directory Structure
```
├── public/                 # Static assets
│   ├── Shark-Image.png    # Loading spinner image
│   └── vite.svg          # Vite logo
├── src/
│   ├── assets/           # Project assets
│   ├── components/       # Reusable components
│   ├── Pages/           # Page components and projects
│   └── style.css        # Global styles
```

## Key Files

### Components
- `src/components/Sidebar.jsx`
  - Retractable navigation sidebar
  - Features hover-to-expand functionality
  - Context-aware theming (light/dark)

- `src/components/LoadingSpinner.jsx`
  - Loading animation component
  - Uses rotating shark image
  - Displays loading status message

### Pages
- `src/pages/Home.jsx`
  - Main landing page
  - Contains About Me and Projects sections
  - Contact information with links

### Configuration
- `vite.config.js`
  - Vite build configuration
  - React plugin setup
  - Path aliases configuration

### Styling
- `src/style.css`
  - Global styles and theme definitions
  - Responsive layout styles
  - Animation definitions
  - Color scheme:
    - Light theme: Pastel yellow background with coral accents
    - Dark theme: Dark background for Shark Tracker

## Key Features
- Responsive design
- Theme-aware components
- Smooth transitions and animations
- Integrated project showcase
- Clean, modern UI with pastel color scheme