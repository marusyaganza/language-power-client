import { useState, useMemo } from 'react'
import { Container, Stack, TextInput, Select, Button, Title, Group } from '@mantine/core'
import { DefsEditor } from '../components/DefsEditor'
import { ExamplesEditor } from '../components/ExamplesEditor'
import { useLanguage } from '../context/LanguageContext'
import { useCreateWord } from '../hooks/useCreateWord'

const FL_OPTIONS = [
    { value: 'noun', label: 'Noun' },
    { value: 'verb', label: 'Verb' },
    { value: 'adjective', label: 'Adjective' },
    { value: 'adverb', label: 'Adverb' },
    { value: 'phrase', label: 'Phrase' },
    { value: 'idiom', label: 'Idiom' },
    { value: 'other', label: 'Other' },
]

export function NewWordPage() {
    const { language } = useLanguage()
    const hideTranslation = language === 'en'

    const [name, setName] = useState('')
    const [fl, setFl] = useState(null)
    const [transcription, setTranscription] = useState('')
    const [defs, setDefs] = useState([''])
    const [mainDefIndex, setMainDefIndex] = useState(0)
    const [examples, setExamples] = useState([])
    const [audioUrl, setAudioUrl] = useState('')
    const [imgUrl, setImgUrl] = useState('')

    const { mutate: create, isPending } = useCreateWord()

    const trimmedDefs = useMemo(() => defs.map((d) => d.trim()).filter(Boolean), [defs])
    const isValid = name.trim() !== '' && fl !== null && trimmedDefs.length > 0

    function handleSubmit() {
        if (!isValid) return

        const reorderedDefs = [
            defs[mainDefIndex],
            ...defs.filter((_, i) => i !== mainDefIndex),
        ].map((d) => d.trim()).filter(Boolean)

        const cleanedExamples = examples
            .map((e) => ({ text: e.text.trim(), translation: hideTranslation ? '' : e.translation.trim() }))
            .filter((e) => e.text !== '')

        create({
            uuid: null,
            name: name.trim(),
            language,
            stems: [],
            fl,
            transcription: transcription.trim() || null,
            defs: reorderedDefs,
            examples: cleanedExamples,
            audio_url: audioUrl.trim() || null,
            img_url: imgUrl.trim() || null,
        })
    }

    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Title order={2}>Add a new word</Title>

                <TextInput
                    label="Word"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    required
                />
                <Select
                    label="Part of speech"
                    data={FL_OPTIONS}
                    value={fl}
                    onChange={setFl}
                    required
                />
                <TextInput
                    label="Transcription"
                    placeholder="Optional"
                    value={transcription}
                    onChange={(e) => setTranscription(e.currentTarget.value)}
                />

                <DefsEditor
                    defs={defs}
                    mainIndex={mainDefIndex}
                    onDefsChange={setDefs}
                    onMainIndexChange={setMainDefIndex}
                />

                <ExamplesEditor
                    examples={examples}
                    onExamplesChange={setExamples}
                    hideTranslation={hideTranslation}
                />

                <TextInput
                    label="Audio URL"
                    placeholder="Optional"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.currentTarget.value)}
                />
                <TextInput
                    label="Image URL"
                    placeholder="Optional"
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.currentTarget.value)}
                />

                <Group justify="flex-end">
                    <Button onClick={handleSubmit} disabled={!isValid} loading={isPending}>
                        Save word
                    </Button>
                </Group>
            </Stack>
        </Container>
    )
}