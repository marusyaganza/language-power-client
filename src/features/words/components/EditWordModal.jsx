import { useState, useEffect } from 'react'
import { Modal, Stack, TextInput, Text, Group, Button } from '@mantine/core'
import { DefsEditor } from './DefsEditor'
import { ExamplesEditor } from './ExamplesEditor'
import { useEditWord } from '../queries'

export function EditWordModal({ word, opened, onClose }) {
    const [defs, setDefs] = useState([])
    const [defsError, setDefsError] = useState(null)
    const [mainDefIndex, setMainDefIndex] = useState(0)
    const [examples, setExamples] = useState([])
    const [audioUrl, setAudioUrl] = useState('')
    const [imgUrl, setImgUrl] = useState('')

    const { mutate: save, isPending } = useEditWord()

    useEffect(() => {
        if (word) {
            setDefs(word.defs)
            setDefsError(null)
            setMainDefIndex(0)
            setExamples(word.examples.map((e) => ({ text: e.text, translation: e.translation })))
            setAudioUrl(word.audio_url ?? '')
            setImgUrl(word.img_url ?? '')
        }
    }, [word])

    function handleDefsChange(newDefs) {
        setDefs(newDefs)
        if (newDefs.length > 0) {
            setDefsError(null)
        }
    }

    function handleSave() {
        const cleanedDefs = defs.map((d) => d.trim())
        if (cleanedDefs.length === 0 || cleanedDefs.some((d) => d === '')) {
            setDefsError('Definitions cannot be empty or blank')
            return
        }

        const reorderedDefs = [
            cleanedDefs[mainDefIndex],
            ...cleanedDefs.filter((_, i) => i !== mainDefIndex),
        ]

        save(
            {
                wordId: word.id,
                changes: {
                    defs: reorderedDefs,
                    examples,
                    audio_url: audioUrl || null,
                    img_url: imgUrl || null,
                },
            },
            { onSuccess: onClose }
        )
    }

    if (!word) return null

    return (
        <Modal opened={opened} onClose={onClose} title={`Edit "${word.name}"`} size="lg">
            <Stack gap="lg">
                <Stack gap={4}>
                    <DefsEditor
                        defs={defs}
                        mainIndex={mainDefIndex}
                        onDefsChange={handleDefsChange}
                        onMainIndexChange={setMainDefIndex}
                    />
                    {defsError && <Text c="red" size="sm">{defsError}</Text>}
                </Stack>
                <ExamplesEditor examples={examples} onExamplesChange={setExamples} hideTranslation={word.language == 'en'} />
                <TextInput
                    label="Audio URL"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.currentTarget.value)}
                />
                <TextInput
                    label="Image URL"
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.currentTarget.value)}
                />
                <Group justify="flex-end">
                    <Button variant="default" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} loading={isPending} disabled={defs.length === 0}>
                        Save
                    </Button>
                </Group>
            </Stack>
        </Modal>
    )
}