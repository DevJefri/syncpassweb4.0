import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { OidcProvider } from './auth/OidcProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OidcProvider>
      <App />
    </OidcProvider>
  </StrictMode>,
)
