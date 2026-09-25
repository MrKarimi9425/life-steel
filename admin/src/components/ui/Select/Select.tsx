import ArrowDown02Icon from '@/assets/icons/iconsax/linear/arrow-down-02.svg?react'
import CloseCircleIcon from '@/assets/icons/iconsax/linear/close-circle.svg?react'
/* eslint-disable @typescript-eslint/no-unused-vars */
import { forwardRef } from 'react'
import ReactSelect from 'react-select'
import classNames from '../utils/classNames'
import { useConfig } from '../ConfigProvider'
import { useForm, useFormItem } from '../Form/context'
import { useInputGroup } from '../InputGroup/context'
import Spinner from '../Spinner/Spinner'
import { CONTROL_SIZES } from '../utils/constants'
import DefaultOption from './Option'
import type { ForwardedRef } from 'react'
import type {
    GroupBase,
    Props as ReactSelectProps,
    SelectInstance,
} from 'react-select'
import type { CommonProps, TypeAttributes } from '../@types/common'

const DefaultDropdownIndicator = () => (
    <div className="select-dropdown-indicator">
        <ArrowDown02Icon
            aria-hidden="true"
            focusable="false"
            height={18}
            width={18}
        />
    </div>
)

const DefaultClearIndicator = ({
    innerProps,
}: {
    innerProps: React.HTMLAttributes<HTMLDivElement>
}) => (
    <div {...innerProps}>
        <div className="select-clear-indicator">
            <CloseCircleIcon
                aria-hidden="true"
                focusable="false"
                height={18}
                width={18}
            />
        </div>
    </div>
)

const DefaultLoadingIndicator = () => (
    <Spinner className="select-loading-indicator" />
)

export interface SelectProps<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
>
    extends CommonProps, ReactSelectProps<Option, IsMulti, Group> {
    invalid?: boolean
    size?: TypeAttributes.ControlSize
}

function SelectInner<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
>(
    props: SelectProps<Option, IsMulti, Group>,
    ref: ForwardedRef<SelectInstance<Option, IsMulti, Group>>,
) {
    const {
        components,
        size,
        styles,
        className,
        classNames: selectClassNames,
        invalid,
        placeholder = 'انتخاب کنید',
        ...rest
    } = props
    const { controlSize } = useConfig()
    const formControlSize = useForm()?.size
    const formItemInvalid = useFormItem()?.invalid
    const inputGroupSize = useInputGroup()?.size
    const selectSize = size || inputGroupSize || formControlSize || controlSize
    const isSelectInvalid = invalid || formItemInvalid

    return (
        <ReactSelect<Option, IsMulti, Group>
            ref={ref}
            className={classNames(`select select-${selectSize}`, className)}
            classNamePrefix="select"
            classNames={{
                control: (state) =>
                    classNames(
                        'select-control',
                        CONTROL_SIZES[selectSize].minH,
                        state.isDisabled && 'cursor-not-allowed opacity-50',
                        'bg-gray-100 dark:bg-gray-700',
                        state.isFocused &&
                            'select-control-focused border-primary bg-transparent ring-1 ring-primary',
                        isSelectInvalid &&
                            'select-control-invalid bg-error-subtle',
                        state.isFocused &&
                            isSelectInvalid &&
                            'border-error ring-error',
                    ),
                valueContainer: ({ isMulti, hasValue, selectProps }) =>
                    classNames(
                        'select-value-container',
                        isMulti &&
                            hasValue &&
                            selectProps.controlShouldRenderValue
                            ? 'flex'
                            : 'grid',
                    ),
                input: ({ value, isDisabled }) =>
                    classNames(
                        'select-input-container',
                        isDisabled ? 'invisible' : 'visible',
                        value && '[transform:translateZ(0)]',
                    ),
                placeholder: () =>
                    classNames(
                        'select-placeholder',
                        isSelectInvalid ? 'text-error' : 'text-gray-400',
                    ),
                indicatorsContainer: () => 'select-indicators-container',
                singleValue: () => 'select-single-value',
                multiValue: () => 'select-multi-value',
                multiValueLabel: () => 'select-multi-value-label',
                multiValueRemove: () => 'select-multi-value-remove',
                menu: () => 'select-menu',
                ...selectClassNames,
            }}
            styles={{
                control: () => ({}),
                valueContainer: () => ({}),
                input: ({ margin, paddingTop, paddingBottom, ...provided }) =>
                    provided,
                placeholder: () => ({}),
                singleValue: () => ({}),
                multiValue: () => ({}),
                multiValueLabel: () => ({}),
                multiValueRemove: () => ({}),
                menu: ({
                    backgroundColor,
                    marginTop,
                    marginBottom,
                    border,
                    borderRadius,
                    boxShadow,
                    ...provided
                }) => ({ ...provided, zIndex: 50 }),
                ...styles,
            }}
            components={{
                IndicatorSeparator: () => null,
                Option: DefaultOption,
                LoadingIndicator: DefaultLoadingIndicator,
                DropdownIndicator: DefaultDropdownIndicator,
                ClearIndicator: DefaultClearIndicator,
                ...components,
            }}
            placeholder={placeholder}
            {...rest}
        />
    )
}

const Select = forwardRef(SelectInner) as <
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
>(
    props: SelectProps<Option, IsMulti, Group> & {
        ref?: ForwardedRef<SelectInstance<Option, IsMulti, Group>>
    },
) => ReturnType<typeof SelectInner>

export default Select
