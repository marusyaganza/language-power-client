// pages/GamePage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Progress, Title, Text, TextInput, Button, Stack,
    Loader, Center, ActionIcon, Group, Image, Box,
} from '@mantine/core'
import { IconX, IconPlayerPlay } from '@tabler/icons-react'
import { useLanguage } from '@/context/LanguageContext'
import { fetchGameSession, submitAnswer, fetchGameResult } from '@/api/games'
import { saveGameSession, loadGameSession, clearGameSession } from '@/games/gameSessionStorage'
import { randomMessage } from '@/games/gameMessages'

function ResultScreen({ result, onFinish }) {
    return (
        <Center style={{ minHeight: '100vh' }}>
            <Stack align="center" gap="xl">
                <Title order={2} fs="italic">Training complete</Title>

                <Box
                    style={{
                        border: '1px solid var(--mantine-color-gray-3)',
                        borderRadius: 8,
                        padding: '20px 32px',
                    }}
                >
                    <Stack gap="sm">
                        <Text>Your result: <Text span c="grape" fw={600}>{result.result_percentage}%</Text></Text>
                        <Text>Learned words: <Text span c="indigo" fw={600}>{result.learned_words}</Text></Text>
                        <Text>Answered correctly: <Text span c="indigo" fw={600}>{result.correct_count}</Text></Text>
                    </Stack>
                </Box>

                <Button color="green" onClick={onFinish}>Finish</Button>
            </Stack>
        </Center>
    )
}

export function GamePage() {
    const { gameId } = useParams()
    const navigate = useNavigate()
    const { language } = useLanguage()

    const [session, setSession] = useState(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answer, setAnswer] = useState('')
    const [feedback, setFeedback] = useState(null) // { isCorrect, correctAnswer } | null
    const [footerMessage, setFooterMessage] = useState(randomMessage('initial'))
    const [result, setResult] = useState(null) // GameResult | null — set once session is complete
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingResult, setIsLoadingResult] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        let cancelled = false

        async function loadOrStart() {
            setIsLoading(true)
            const cached = loadGameSession(gameId)

            if (cached) {
                if (!cancelled) {
                    setSession(cached)
                    setCurrentIndex(cached.currentIndex)
                    setIsLoading(false)
                }
                return
            }

            try {
                const data = await fetchGameSession(gameId, language)
                const newSession = {
                    sessionId: data.session_id,
                    task: data.task,
                    questions: data.questions,
                    currentIndex: 0,
                }
                if (!cancelled) {
                    saveGameSession(gameId, newSession)
                    setSession(newSession)
                    setCurrentIndex(0)
                    setIsLoading(false)
                }
            } catch {
                if (!cancelled) {
                    setError('Could not load this game. Try again.')
                    setIsLoading(false)
                }
            }
        }

        loadOrStart()
        return () => { cancelled = true }
    }, [gameId, language])

    async function handleCheck() {
        const currentQuestion = session.questions[currentIndex]
        setIsSubmitting(true)
        try {
            const res = await submitAnswer(gameId, {
                sessionId: session.sessionId,
                wordId: currentQuestion.id,
                answer,
            })
            setFeedback({ isCorrect: res.is_correct, correctAnswer: res.correct_answer })
            setFooterMessage(randomMessage(res.is_correct ? 'success' : 'error'))
        } catch {
            setError('Could not submit your answer. Try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleContinue() {
        const nextIndex = currentIndex + 1
        const isLastQuestion = nextIndex >= session.questions.length

        if (isLastQuestion) {
            setIsLoadingResult(true)
            try {
                const data = await fetchGameResult(session.sessionId)
                clearGameSession(gameId)
                setResult(data)
            } catch {
                setError('Could not load your results. Try again.')
            } finally {
                setIsLoadingResult(false)
            }
            return
        }

        const updated = { ...session, currentIndex: nextIndex }
        saveGameSession(gameId, updated)
        setSession(updated)
        setCurrentIndex(nextIndex)
        setAnswer('')
        setFeedback(null)
    }

    function handleClose() {
        clearGameSession(gameId)
        navigate('/games')
    }

    function handleFinish() {
        navigate('/games')
    }

    function playAudio(url) {
        new Audio(url).play()
    }

    if (isLoading || isLoadingResult) {
        return (
            <Center h="100vh">
                <Loader size="lg" />
            </Center>
        )
    }

    if (error) {
        return (
            <Center h="100vh">
                <Text c="red">{error}</Text>
            </Center>
        )
    }

    if (result) {
        return <ResultScreen result={result} onFinish={handleFinish} />
    }

    const currentQuestion = session.questions[currentIndex]
    const progressPercent = (currentIndex / session.questions.length) * 100
    const info = currentQuestion.additional_info

    return (
        <Box style={{ minHeight: '100vh' }}>
            <Group gap={0} align="center" wrap="nowrap">
                <Progress value={progressPercent} radius={0} size="sm" style={{ flex: 1 }} />
                <ActionIcon variant="subtle" color="dark" onClick={handleClose} size="lg" mx="sm">
                    <IconX size={20} />
                </ActionIcon>
            </Group>

            <Center style={{ minHeight: 'calc(100vh - 40px)' }}>
                <Stack align="center" gap="md" style={{ maxWidth: 420, width: '100%' }}>
                    {feedback && !feedback.isCorrect && feedback.correctAnswer && (
                        <Box
                            style={{
                                border: '1px dashed var(--mantine-color-green-6)',
                                borderRadius: 4,
                                padding: '4px 12px',
                                color: 'var(--mantine-color-green-7)',
                                fontStyle: 'italic',
                            }}
                        >
                            {feedback.correctAnswer}
                        </Box>
                    )}

                    <Group gap={6} justify="center">
                        <Text fs="italic">{session.task}</Text>
                        {feedback && info.audio_url && (
                            <ActionIcon variant="subtle" size="sm" onClick={() => playAudio(info.audio_url)}>
                                <IconPlayerPlay size={14} />
                            </ActionIcon>
                        )}
                    </Group>

                    <Stack gap={4} align="center">
                        {currentQuestion.question.map((def, i) => (
                            <Text key={i}>🌟 {def}</Text>
                        ))}
                    </Stack>

                    <TextInput
                        value={answer}
                        onChange={(e) => setAnswer(e.currentTarget.value)}
                        readOnly={feedback !== null}
                        size="md"
                        autoFocus
                        w="100%"
                        styles={feedback ? {
                            input: {
                                borderColor: feedback.isCorrect
                                    ? 'var(--mantine-color-green-6)'
                                    : 'var(--mantine-color-red-6)',
                                backgroundColor: feedback.isCorrect
                                    ? 'var(--mantine-color-green-0)'
                                    : 'var(--mantine-color-red-0)',
                            },
                        } : undefined}
                    />

                    {feedback === null ? (
                        <Button onClick={handleCheck} loading={isSubmitting} disabled={!answer.trim()}>
                            Check
                        </Button>
                    ) : (
                        <Button onClick={handleContinue}>Continue</Button>
                    )}

                    {feedback && info.examples && info.examples.length > 0 && (
                        <Stack gap={4} mt="md" style={{ alignSelf: 'flex-start' }}>
                            <Text size="sm" fw={600}>Examples</Text>
                            {info.examples.map((ex, i) => (
                                <Text key={i} size="sm" fs="italic" c="dimmed">
                                    {ex.text} ({ex.translation})
                                </Text>
                            ))}
                        </Stack>
                    )}

                    {feedback && info.img_url && (
                        <Image src={info.img_url} w={160} radius="md" mt="md" />
                    )}
                </Stack>
            </Center>

            <Text ta="center" fs="italic" size="sm" c="dimmed" py="md">
                {footerMessage}
            </Text>
        </Box>
    )
}