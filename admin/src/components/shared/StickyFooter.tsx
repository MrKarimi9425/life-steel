import {
    useEffect,
    useRef,
    useState,
    type HTMLAttributes,
    type ReactNode,
} from 'react'
import classNames from 'classnames'
import useDebounce from '@/hooks/useDebounce'

interface StickyFooterProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children'
> {
    stickyClass?: string
    defaultClass?: string
    children?: ReactNode | ((isSticky: boolean) => ReactNode)
}

const StickyFooter = ({
    children,
    className,
    stickyClass,
    defaultClass,
    ...rest
}: StickyFooterProps) => {
    const [isSticky, setIsSticky] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const debounceFn = useDebounce((value: boolean) => setIsSticky(value), 100)

    useEffect(() => {
        const element = ref.current
        if (!element) return
        const observer = new IntersectionObserver(
            ([entry]) => debounceFn(entry.intersectionRatio < 1),
            { threshold: [1] },
        )
        observer.observe(element)
        return () => observer.unobserve(element)
    }, [debounceFn])

    return (
        <div
            ref={ref}
            className={classNames(
                'static -bottom-[1px]',
                className,
                isSticky ? classNames(stickyClass, 'sticky') : defaultClass,
            )}
            {...rest}
        >
            {typeof children === 'function' ? children(isSticky) : children}
        </div>
    )
}

export default StickyFooter
