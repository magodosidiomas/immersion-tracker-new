import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Request persistent storage to prevent browser from silently clearing IndexedDB
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then((granted) => {
    if (!granted) {
      console.warn('Persistent storage not granted — IndexedDB may be cleared by the browser under storage pressure.')
    }
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
