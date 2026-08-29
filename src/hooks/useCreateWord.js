import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { saveWord } from '../api/words'

export function useCreateWord() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: saveWord,
        onSuccess: (word) => {
            queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
            notifications.show({ message: `"${word.name}" added to vocabulary`, color: 'green' })
            navigate('/words/vocabulary')
        },
        onError: () => {
            notifications.show({ message: 'Failed to save word', color: 'red' })
        },
    })
}