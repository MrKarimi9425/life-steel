import classNames from 'classnames'
import type { ChangeEvent, Ref } from 'react'
import { useCallback, useContext, useState } from 'react'
import type { CommonProps } from '../@types/common'
import type { CheckboxValue } from './context'
import CheckboxGroupContext from './context'

export interface CheckboxProps extends CommonProps {
    checked?: boolean
    checkboxClass?: string
    defaultChecked?: boolean
    disabled?: boolean
    indeterminate?: boolean
    labelRef?: Ref<HTMLLabelElement>
    name?: string
    onChange?: (values: boolean, event: ChangeEvent<HTMLInputElement>) => void
    readOnly?: boolean
    ref?: Ref<HTMLInputElement>
    value?: CheckboxValue
}

const Checkbox = (props: CheckboxProps) => {
    const {
        name: nameContext,
        value: groupValue,
        onChange: onGroupChange,
        checkboxClass: checkboxClassContext,
    } = useContext(CheckboxGroupContext)
    const {
        checked: controlledChecked,
        className,
        checkboxClass,
        onChange,
        children,
        disabled,
        indeterminate = false,
        readOnly,
        name = nameContext,
        defaultChecked,
        value,
        labelRef,
        ref,
        ...rest
    } = props
    const isChecked = useCallback(() => {
        if (groupValue !== undefined && value !== undefined) {
            return groupValue.some((item) => item === value)
        }
        return controlledChecked || defaultChecked
    }, [controlledChecked, defaultChecked, groupValue, value])
    const [checkboxChecked, setCheckboxChecked] = useState(isChecked())
    const checked =
        controlledChecked !== undefined
            ? controlledChecked
            : groupValue !== undefined
              ? groupValue.includes(value as never)
              : checkboxChecked
    const checkboxColor =
        checkboxClass || checkboxClassContext || 'text-primary'

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextChecked =
            groupValue !== undefined
                ? !groupValue.includes(value as never)
                : !checkboxChecked
        if (disabled || readOnly) return
        setCheckboxChecked(nextChecked)
        onChange?.(nextChecked, event)
        onGroupChange?.(value as CheckboxValue, nextChecked, event)
    }

    return (
        <label
            ref={labelRef}
            className={classNames(
                'checkbox-label',
                disabled && 'disabled',
                className,
            )}
        >
            <span className="checkbox-wrapper m-2 relative">
                <input
                    {...rest}
                    ref={ref}
                    checked={checked}
                    className={classNames(
                        'checkbox peer',
                        checkboxColor,
                        disabled && 'disabled',
                    )}
                    disabled={disabled}
                    name={name}
                    readOnly={readOnly}
                    type="checkbox"
                    onChange={handleChange}
                />
                <svg
                    className="pointer-events-none absolute top-2/4 left-2/4 mt-[1.25px] h-3.5 w-3.5 -translate-x-2/4 -translate-y-2/4 fill-neutral stroke-neutral opacity-0 transition-opacity peer-checked:opacity-100"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {indeterminate ? (
                        <path
                            clipRule="evenodd"
                            d="M5 10a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1z"
                            fillRule="evenodd"
                        />
                    ) : (
                        <path
                            clipRule="evenodd"
                            d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
                            fillRule="evenodd"
                        />
                    )}
                </svg>
            </span>
            {children ? (
                <span className={classNames(disabled && 'opacity-50')}>
                    {children}
                </span>
            ) : null}
        </label>
    )
}

export default Checkbox
