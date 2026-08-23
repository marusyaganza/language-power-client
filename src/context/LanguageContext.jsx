// src/context/LanguageContext.jsx
import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext(null)

const SUPPORTED_LANGUAGES = [
    { value: 'es', label: 'Spanish' },
    { value: 'en', label: 'English' },
]

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(
        localStorage.getItem('language') || 'es'
    )

    function updateLanguage(value) {
        setLanguage(value)
        localStorage.setItem('language', value)
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, SUPPORTED_LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const ctx = useContext(LanguageContext)
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
    return ctx
}