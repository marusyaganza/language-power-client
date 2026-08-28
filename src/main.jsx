import '@mantine/core/styles.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider, AppShell } from '@mantine/core'
import { LanguageProvider } from './context/LanguageContext'
import Header from './components/Header'
import { WordSearchPage } from './pages/WordSearchPage'
import { SignUpPage } from './pages/SignUpPage'
import { LoginPage } from './pages/LoginPage'
import { RequireAuth } from './components/RequireAuth'

const queryClient = new QueryClient()

function AuthenticatedLayout() {
  function handleLogout() {
    // clear session, redirect to /login, etc.
  }

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header onLogout={handleLogout} />
      <AppShell.Main>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/words/search" element={<WordSearchPage />} />
            {/* /vocabulary, /games routes go here */}
          </Route>
        </Routes>
      </AppShell.Main>
    </AppShell>
  )
}

function App() {
  return (
    <Routes>
      {/* Public routes — no header, no AppShell */}
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* <Route path="/login" element={<LoginPage />} /> */}

      {/* Everything else goes through the authenticated shell */}
      <Route path="/*" element={<AuthenticatedLayout />} />
    </Routes>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LanguageProvider>
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>
)