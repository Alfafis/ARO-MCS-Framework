import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'
import { initSentry } from './lib/sentry'
import ErrorFallback from './components/layout/ErrorFallback.tsx'
import { PlataformaConfigProvider } from './context/PlataformaConfigContext'
import { TemaProvider } from './context/TemaContext'

initSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <TemaProvider>
        <PlataformaConfigProvider>
          <App />
        </PlataformaConfigProvider>
      </TemaProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>
)
