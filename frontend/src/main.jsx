import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// On startup: if the app was built with a real backend URL (https://),
// clear any stale localStorage overrides from previous testing sessions.
const builtInApiUrl = import.meta.env.VITE_API_URL || '/api';
if (builtInApiUrl.startsWith('https://')) {
  localStorage.removeItem('custom_api_url');
  localStorage.removeItem('demo_mode');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
