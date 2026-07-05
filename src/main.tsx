import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './context/AuthContext'
import GlobalErrorToast from './components/ui/GlobalErrorToast'
import App from './App'
import './index.css'

const root = document.getElementById('root')!

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GlobalErrorToast />
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
