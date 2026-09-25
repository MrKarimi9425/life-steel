import debounce from 'lodash/debounce'
import type { DebounceSettingsLeading } from 'lodash'

function useDebounce<T extends (...args: never[]) => unknown>(
    func: T,
    wait?: number,
    options?: DebounceSettingsLeading,
) {
    return debounce(func, wait, options)
}

export default useDebounce
