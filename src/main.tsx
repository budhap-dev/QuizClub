import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import { initTheme } from './app/theme'
import { initVaultSync } from './features/vault/sync'
import './index.css'

// Apply the saved theme before the first paint so there is no flash of the default palette.
initTheme()
// If this device has an unlocked cloud vault, pull on load and push after edits.
initVaultSync()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
