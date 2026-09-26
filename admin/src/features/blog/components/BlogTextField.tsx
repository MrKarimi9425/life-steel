import { getIn, useFormikContext } from 'formik'
import { FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'

type Props = {
    name: string
    label: string
    direction?: 'rtl' | 'ltr'
    required?: boolean
    multiline?: boolean
}

export default function BlogTextField({
    name,
    label,
    direction = 'rtl',
    required,
    multiline,
}: Props) {
    const form = useFormikContext<Record<string, unknown>>()
    const error = getIn(form.errors, name) as string | undefined
    const invalid = Boolean(
        error && (getIn(form.touched, name) || form.submitCount),
    )
    return (
        <FormItem
            label={label}
            htmlFor={name}
            asterisk={required}
            invalid={invalid}
            errorMessage={error}
        >
            <Input
                id={name}
                {...form.getFieldProps(name)}
                dir={direction}
                textArea={multiline}
                rows={multiline ? 3 : undefined}
            />
        </FormItem>
    )
}
