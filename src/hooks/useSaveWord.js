import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { saveWord } from '../api/words'

export function useSaveWord() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: saveWord,
        onSuccess: (savedWord, variables) => {
            queryClient.setQueriesData({ queryKey: ['wordSearch'] }, (old) => {
                if (!old) return old
                return old.map((w) =>
                    w.uuid === variables.uuid ? { ...w, saved: true } : w
                )
            })
            notifications.show({
                message: `"${savedWord.name}" saved to vocabulary`,
                color: 'green',
            })
        },
        onError: (error) => {
            if (error.status === 409) {
                notifications.show({
                    message: 'This word is already in your vocabulary',
                    color: 'yellow',
                })
            } else {
                notifications.show({
                    message: 'Something went wrong saving this word',
                    color: 'red',
                })
            }
        },
    })
}