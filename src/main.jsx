import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './theme/global.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider, AppShell } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { LanguageProvider } from './context/LanguageContext'
import Header from './components/Header'
import { SearchPage } from './features/words/pages/SearchPage'
import { VocabularyPage } from './features/words/pages/VocabularyPage'
import { NewWordPage } from './features/words/pages/NewWordPage'
import { SignUpPage } from './features/auth/pages/SignUpPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { GamesPage } from './pages/GamesPage'
import { GamePage } from './pages/GamePage'
import { RequireAuth } from './app/RequireAuth'
import { useNavigate } from "react-router-dom";
import { useLogout } from './features/auth'
import { theme, cssVariablesResolver } from './theme/theme'

const queryClient = new QueryClient()

function AuthenticatedLayout() {
  const navigate = useNavigate()
  const logout = useLogout()

  function handleLogout() {
    logout.mutate(undefined, { onSettled: () => navigate('/login') })
  }

  return (
    <AppShell header={{ height: 60 }} padding="md" styles={{ header: { backgroundColor: 'rgba(9, 9, 64, 0.82)', backdropFilter: 'blur(8px)', borderColor: 'var(--app-border)' } }}>
      <Header onLogout={handleLogout} />
      <AppShell.Main>
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/words/search" element={<SearchPage />} />
            <Route path="/words/vocabulary" element={<VocabularyPage />} />
            <Route path="/words/new" element={<NewWordPage />} />
            <Route path="/games" element={<GamesPage />} />
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

      <Route element={<RequireAuth />}>
        <Route path="/games/:gameId" element={<GamePage />} />
      </Route>

      {/* Everything else goes through the authenticated shell */}
      <Route path="/*" element={<AuthenticatedLayout />} />
    </Routes>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver} forceColorScheme="dark">
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