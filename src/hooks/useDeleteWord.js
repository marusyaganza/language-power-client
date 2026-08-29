import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { deleteWord } from '../api/words'

export function useDeleteWord() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteWord,
        onSuccess: () => {
            // vocabulary list is the only place deletes happen from,
            // so just invalidate all vocabulary queries regardless of
            // current search/page/sort — simpler than patching every cache entry
            queryClient.invalidateQueries({ queryKey: ['vocabulary'] })
            notifications.show({ message: 'Word deleted', color: 'green' })
        },
        onError: (error) => {
            notifications.show({
                message: error.status === 404 ? 'Word already deleted' : 'Failed to delete word',
                color: 'red',
            })
        },
    })
}