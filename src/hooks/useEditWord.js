import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { updateWord } from '../api/words'

export function useEditWord() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ wordId, payload }) => updateWord(wordId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
            notifications.show({ message: 'Word updated', color: 'green' })
        },
        onError: () => {
            notifications.show({ message: 'Failed to update word', color: 'red' })
        },
    })
}