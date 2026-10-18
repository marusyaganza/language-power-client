// src/components/Header.jsx
import { Group, Select, Button, Image, AppShell } from '@mantine/core'
import { NavLink as RouterNavLink } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import logo from '../assets/logo.png'
import classes from './Header.module.css'

export default function Header({ onLogout }) {
  const { language, setLanguage, SUPPORTED_LANGUAGES } = useLanguage()

  return (
    <AppShell.Header p="md">
      <Group justify="space-between" h="100%">
        <Group gap="xl">
          <Image src={logo} alt="App logo" h={32} w="auto" fit="contain" />

          <Group gap="md" component="nav">
            <RouterNavLink to="/words/search" className={classes.link}>
              Search
            </RouterNavLink>
            <RouterNavLink to="/words/vocabulary" className={classes.link}>
              Vocabulary
            </RouterNavLink>
            <RouterNavLink to="/games" className={classes.link}>
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
          <Button variant="subtle" color="gray" mod={{ 'hover-fill': 'signal' }} onClick={onLogout}>
            Logout
          </Button>
        </Group>
      </Group>
    </AppShell.Header>
  )
}