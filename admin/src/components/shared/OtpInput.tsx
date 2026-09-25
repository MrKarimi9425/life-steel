import Input from '@/components/ui/Input'
import classNames from '@/utils/classNames'
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

interface OtpInputProps {
    autoFocus?: boolean
    className?: string
    disabled?: boolean
    inputClass?: string
    invalid?: boolean
    length?: number
    onChange?: (value: string) => void
    placeholder?: string
    value?: string
}

const OtpInput = ({
    length = 6,
    value = '',
    onChange,
    disabled = false,
    className = '',
    inputClass,
    autoFocus = false,
    invalid = false,
}: OtpInputProps) => {
    const [, setActiveInput] = useState(0)
    const inputRefs = useRef<Array<HTMLInputElement | null>>([])

    useEffect(() => {
        inputRefs.current = Array(length)
            .fill(null)
            .map((_, index) => inputRefs.current[index] || null)
    }, [length])

    const handleChange = (
        event: ChangeEvent<HTMLInputElement>,
        index: number,
    ) => {
        const nextDigit = event.target.value.replace(/\D/g, '').slice(-1)
        const nextValue = value.padEnd(length, ' ').slice(0, length).split('')
        nextValue[index] = nextDigit || ' '
        onChange?.(nextValue.join(''))

        if (nextDigit && index < length - 1) {
            setActiveInput(index + 1)
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (
        event: KeyboardEvent<HTMLInputElement>,
        index: number,
    ) => {
        if (event.key === 'Backspace') {
            event.preventDefault()
            const nextValue = value
                .padEnd(length, ' ')
                .slice(0, length)
                .split('')

            if (nextValue[index]?.trim()) {
                nextValue[index] = ' '
                onChange?.(nextValue.join(''))
            } else if (index > 0) {
                nextValue[index - 1] = ' '
                onChange?.(nextValue.join(''))
                setActiveInput(index - 1)
                inputRefs.current[index - 1]?.focus()
            }
        } else if (event.key === 'ArrowLeft' && index > 0) {
            event.preventDefault()
            setActiveInput(index - 1)
            inputRefs.current[index - 1]?.focus()
        } else if (event.key === 'ArrowRight' && index < length - 1) {
            event.preventDefault()
            setActiveInput(index + 1)
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault()
        const pastedValue = event.clipboardData
            .getData('text/plain')
            .replace(/\D/g, '')
            .slice(0, length)

        if (pastedValue) {
            onChange?.(pastedValue.padEnd(length, ' '))
            inputRefs.current[Math.min(pastedValue.length, length) - 1]?.focus()
        }
    }

    return (
        <div className={`flex gap-2 ${className}`} dir="ltr">
            {Array(length)
                .fill(null)
                .map((_, index) => (
                    <Input
                        aria-label={`Digit ${index + 1} of ${length}`}
                        autoFocus={autoFocus && index === 0}
                        className={classNames(
                            'text-center text-lg aspect-square h-auto',
                            inputClass,
                        )}
                        disabled={disabled}
                        inputMode="numeric"
                        invalid={invalid}
                        key={index}
                        maxLength={1}
                        pattern="[0-9]*"
                        placeholder={''}
                        ref={(element: HTMLInputElement | null) => {
                            inputRefs.current[index] = element
                        }}
                        type="text"
                        value={value[index]?.trim() || ''}
                        onChange={(event) =>
                            handleChange(
                                event as ChangeEvent<HTMLInputElement>,
                                index,
                            )
                        }
                        onFocus={() => setActiveInput(index)}
                        onKeyDown={(event) =>
                            handleKeyDown(
                                event as KeyboardEvent<HTMLInputElement>,
                                index,
                            )
                        }
                        onPaste={handlePaste}
                    />
                ))}
        </div>
    )
}

export default OtpInput
