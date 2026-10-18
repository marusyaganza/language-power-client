// src/theme/theme.ts
// Dark-first theme. Light scheme later = fill `light` in cssVariablesResolver
// (and swap the `dark` tuple usage), then drop forceColorScheme in main.jsx.
import {
    createTheme, Button, Card, Paper, Input, InputWrapper, SegmentedControl,
    Pagination, Badge, Tooltip, Combobox, Modal, ActionIcon,
    type MantineColorsTuple,
} from '@mantine/core'
import classes from './components.module.css'

const FONT_BODY = 'Itim, "Comic Neue", system-ui, sans-serif'
const FONT_UI = 'Jost, "Futura", system-ui, sans-serif'

// Mantine dark scheme reads: 0 text, 2 dimmed, 4 borders, 5 hover, 6 inputs, 7 body.
const navy: MantineColorsTuple = [
    '#E8E8F5', '#C2C2E0', '#A0A0CC', '#6E6EA6', '#2E2E72',
    '#222266', '#15154F', '#090940', '#070732', '#050524',
]

const rose: MantineColorsTuple = [ // primary, brand #E5576A at 5
    '#FDECEE', '#F9C9CF', '#F4A3AD', '#EE7D8C', '#EA6A7B',
    '#E5576A', '#D0465A', '#B0384B', '#8E2C3C', '#6C202E',
]

const signal: MantineColorsTuple = [ // secondary, brand #F4E87D at 4
    '#FEFCEB', '#FCF7CC', '#F9F1AB', '#F7EC93', '#F4E87D',
    '#E3D561', '#C7B949', '#A39737', '#7D7329', '#574F1B',
]

const olive: MantineColorsTuple = [ // status/highlight only, #A8A964 at 5, #444434 at 9 (fill only)
    '#F4F4E6', '#E3E4C4', '#D0D1A0', '#BDBE83', '#B2B373',
    '#A8A964', '#8D8E51', '#6E6F40', '#575842', '#444434',
]

const scarlet: MantineColorsTuple = [ // destructive actions, #FF5A3C at 5
    '#FFEDE9', '#FFD0C6', '#FFAF9F', '#FF8E77', '#FF7457',
    '#FF5A3C', '#E8462A', '#C2361E', '#9A2915', '#721D0E',
]

const uiFont = { fontFamily: 'var(--app-font-ui)' }

export const theme = createTheme({
    colors: { dark: navy, rose, signal, olive, scarlet },
    primaryColor: 'rose',
    primaryShade: 5, // brand #E5576A in both schemes; autoContrast gives it navy text
    black: '#090940',
    autoContrast: true,
    luminanceThreshold: 0.19, // rose #E5576A is ~0.20: navy text on rose/signal/olive fills (AA)
    fontFamily: FONT_BODY,
    headings: { fontFamily: FONT_BODY, fontWeight: '400' }, // Itim ships one weight
    defaultRadius: 'sm',
    cursorType: 'pointer',
    other: { fontUi: FONT_UI },
    components: {
        Button: Button.extend({
            classNames: { root: classes.button }, // adds variant="sage"
            styles: { root: { ...uiFont, letterSpacing: '0.02em' } },
        }),
        ActionIcon: ActionIcon.extend({ defaultProps: { color: 'gray' } }),
        Card: Card.extend({
            defaultProps: { withBorder: true },
            styles: {
                root: {
                    backgroundColor: 'var(--app-surface)',
                    borderColor: 'var(--app-border)',
                    boxShadow: 'var(--app-card-shadow)',
                },
            },
        }),
        Paper: Paper.extend({ styles: { root: { backgroundColor: 'var(--app-surface)' } } }),
        Modal: Modal.extend({
            styles: {
                content: { backgroundColor: 'var(--app-surface)', border: '1px solid var(--app-border)' },
                header: { backgroundColor: 'var(--app-surface)' },
            },
        }),
        Input: Input.extend({ classNames: { input: classes.input }, styles: { input: uiFont } }),
        InputWrapper: InputWrapper.extend({
            styles: { label: uiFont, description: uiFont, error: uiFont },
        }),
        SegmentedControl: SegmentedControl.extend({
            classNames: { root: classes.segmented },
            styles: { label: uiFont },
        }),
        Pagination: Pagination.extend({ styles: { control: uiFont } }),
        Badge: Badge.extend({ styles: { root: uiFont } }),
        Tooltip: Tooltip.extend({ styles: { tooltip: uiFont } }),
        Combobox: Combobox.extend({ styles: { option: uiFont } }),
    },
})

export function cssVariablesResolver() {
    return {
        variables: {
            '--app-font-ui': FONT_UI,
        },
        dark: {
            // Page sits lighter than cards so cards read as focused panels.
            // #1C1C5F keeps text 12:1 and dimmed 6:1 on the bare background.
            '--app-bg': '#1C1C5F',
            '--app-surface': '#0D0D46',
            '--app-surface-raised': '#15154F',
            '--app-border': '#3A3A85',
            '--app-border-strong': '#4F4F9A',
            '--app-card-shadow': '0 10px 30px -12px rgba(4, 4, 30, 0.7)',
            '--app-glow': 'rgba(229, 87, 106, 0.12)',
            '--app-haze': 'rgba(182, 203, 198, 0.10)',
            '--app-sage': '#B6CBC6',
            '--app-sage-hover': '#A3BAB4',
            '--app-word': 'var(--app-sage)',
            '--app-accent': 'var(--mantine-color-rose-5)',
            '--app-signal': 'var(--mantine-color-signal-4)',
            '--app-tag-bg': 'var(--mantine-color-olive-9)',
            '--app-tag-text': 'var(--mantine-color-olive-2)',
            '--mantine-color-body': '#090940',
            // Mantine's dark light/subtle variants use shade 0 (near white); keep these hues visible.
            '--mantine-color-olive-light-color': 'var(--mantine-color-olive-3)',
            '--mantine-color-scarlet-light-color': 'var(--mantine-color-scarlet-4)',
            // Softer, pastel hovers for destructive actions (Mantine darkens by default).
            '--mantine-color-scarlet-light-hover': 'rgba(255, 208, 198, 0.2)',
            '--mantine-color-scarlet-filled-hover': 'var(--mantine-color-scarlet-4)',
        },
        light: {},
    }
}
