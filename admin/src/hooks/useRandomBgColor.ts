import { useCallback } from 'react'

const colors = [
    'bg-indigo-200 dark:bg-indigo-200',
    'bg-emerald-200 dark:bg-emerald-200',
    'bg-cyan-200 dark:bg-cyan-200',
    'bg-blue-200 dark:bg-blue-200',
    'bg-teal-200 dark:bg-teal-200',
    'bg-fuchsia-200 dark:bg-fuchsia-200',
    'bg-pink-200 dark:bg-pink-200',
    'bg-rose-200 dark:bg-rose-200',
    'bg-red-200 dark:bg-red-200',
    'bg-amber-200 dark:bg-amber-200',
    'bg-violet-200 dark:bg-violet-200',
    'bg-purple-200 dark:bg-purple-200',
]

export default function useRandomBgColor() {
    return useCallback((name: string) => {
        const hash = [...name].reduce(
            (total, character) => total + character.charCodeAt(0),
            0,
        )
        return colors[hash % colors.length]
    }, [])
}
