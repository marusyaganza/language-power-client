import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider, AppShell } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { LanguageProvider } from './context/LanguageContext'
import Header from './components/Header'
import { WordSearchPage } from './pages/WordSearchPage'
import { VocabularyPage } from './pages/VocabularyPage'
import { SignUpPage } from './pages/SignUpPage'
import { LoginPage } from './pages/LoginPage'
import { RequireAuth } from './components/RequireAuth'
import { useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { logout } from './api/auth'

const queryClient = new QueryClient()

function AuthenticatedLayout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["currentUser"] })
      navigate("/login")
    },
    onError: () => {
      // Even if the request fails, there's little the user can do about a
      // stale session client-side — send them to login regardless.
      queryClient.removeQueries({ queryKey: ["currentUser"] })
      navigate("/login")
    },
  })

  function handleLogout() {
    logoutMutation.mutate()
  }


  return (
    <AppShell header={{ height: 60 }} padding="md">
      <Header onLogout={handleLogout} />
      <AppShell.Main>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/words/search" element={<WordSearchPage />} />
            <Route path="/words/vocabulary" element={<VocabularyPage />} />
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
            <Notifications />
            <ModalsProvider>
              <App />
            </ModalsProvider>
          </BrowserRouter>
        </LanguageProvider>
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>
)