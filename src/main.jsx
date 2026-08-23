// src/main.jsx
import '@mantine/core/styles.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider, AppShell } from '@mantine/core'
import { LanguageProvider } from './context/LanguageContext'
import Header from './components/Header'
import WordSearchPage from './pages/WordSearchPage'

const queryClient = new QueryClient()

function AuthenticatedLayout() {
  function handleLogout() {
    // clear token/session, redirect to /login, etc.
  }

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header onLogout={handleLogout} />
      <AppShell.Main>
        <Routes>
          <Route path="/words/search" element={<WordSearchPage />} />
          {/* /vocabulary, /games routes go here */}
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <BrowserRouter>
            <AuthenticatedLayout />
            {/* login/signup routes, outside AppShell, go outside this component */}
          </BrowserRouter>
        </LanguageProvider>
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>
)