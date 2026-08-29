// src/components/Header.jsx
import { Group, Select, Button, Image, AppShell } from '@mantine/core'
import { NavLink as RouterNavLink } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import logo from '../assets/logo.png'

const navLinkStyle = ({ isActive }) => ({
  fontWeight: isActive ? 700 : 400,
  textDecoration: 'none',
  color: isActive ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-dark-7)',
})

export default function Header({ onLogout }) {
  const { language, setLanguage, SUPPORTED_LANGUAGES } = useLanguage()

  return (
    <AppShell.Header p="md">
      <Group justify="space-between" h="100%">
        <Group gap="xl">
          <Image src={logo} alt="App logo" h={32} w="auto" fit="contain" />

          <Group gap="md" component="nav">
            <RouterNavLink to="/words/search" style={navLinkStyle}>
              Search
            </RouterNavLink>
            <RouterNavLink to="/words/vocabulary" style={navLinkStyle}>
              Vocabulary
            </RouterNavLink>
            <RouterNavLink to="/games" style={navLinkStyle}>
              Games
            </RouterNavLink>
          </Group>
        </Group>

        <Group gap="md">
          <Select
            data={SUPPORTED_LANGUAGES}
            value={language}
            onChange={setLanguage}
            allowDeselect={false}
            w={140}
          />
          <Button variant="subtle" onClick={onLogout}>
            Logout
          </Button>
        </Group>
      </Group>
    </AppShell.Header>
  )
}