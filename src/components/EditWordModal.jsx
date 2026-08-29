import { useState, useEffect } from 'react'
import { Modal, Stack, TextInput, Group, Button } from '@mantine/core'
import { DefsEditor } from './DefsEditor'
import { ExamplesEditor } from './ExamplesEditor'
import { useEditWord } from '../hooks/useEditWord'

export function EditWordModal({ word, opened, onClose }) {
    const [defs, setDefs] = useState([])
    const [mainDefIndex, setMainDefIndex] = useState(0)
    const [examples, setExamples] = useState([])
    const [audioUrl, setAudioUrl] = useState('')
    const [imgUrl, setImgUrl] = useState('')

    const { mutate: save, isPending } = useEditWord()

    useEffect(() => {
        if (word) {
            setDefs(word.defs)
            setMainDefIndex(0)
            setExamples(word.examples.map((e) => ({ text: e.text, translation: e.translation })))
            setAudioUrl(word.audio_url ?? '')
            setImgUrl(word.img_url ?? '')
        }
    }, [word])

    function handleSave() {
        const reorderedDefs = [
            defs[mainDefIndex],
            ...defs.filter((_, i) => i !== mainDefIndex),
        ]

        save(
            {
                wordId: word.id,
                payload: {
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
                <DefsEditor
                    defs={defs}
                    mainIndex={mainDefIndex}
                    onDefsChange={setDefs}
                    onMainIndexChange={setMainDefIndex}
                />
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
                    <Button onClick={handleSave} loading={isPending}>Save</Button>
                </Group>
            </Stack>
        </Modal>
    )
}