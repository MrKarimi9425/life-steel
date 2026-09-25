import { useEffect, useState } from 'react'

const useScrollTop = () => {
    const [isSticky, setIsSticky] = useState(false)

    useEffect(() => {
        const onScroll = () => setIsSticky(window.scrollY > 0)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return { isSticky }
}

export default useScrollTop
