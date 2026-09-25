import Button from '@/components/ui/Button'
import type { ButtonProps } from '@/components/ui/Button'

type ActionButtonTone = 'primary' | 'danger'

interface ActionButtonProps extends ButtonProps {
    tone?: ActionButtonTone
}

const dangerColorClass: NonNullable<ButtonProps['customColorClass']> = ({
    unclickable,
}) =>
    [
        '!border-error !bg-error !text-white',
        !unclickable &&
            'hover:!border-error hover:!bg-error/90 hover:!text-white',
    ]
        .filter(Boolean)
        .join(' ')

export default function ActionButton({
    tone = 'primary',
    variant,
    customColorClass,
    ...props
}: ActionButtonProps) {
    return (
        <Button
            {...props}
            variant={variant ?? 'solid'}
            customColorClass={
                tone === 'danger' ? dangerColorClass : customColorClass
            }
        />
    )
}
