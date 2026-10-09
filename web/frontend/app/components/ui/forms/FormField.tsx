import { Description, Field, Label } from '@headlessui/react';

type FormFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    hint?: string;
    labelClassName?: string;
    inputClassName?: string;
    hintClassName?: string;
};

const FormField = ({
    label,
    error,
    hint,
    className,
    labelClassName,
    inputClassName,
    hintClassName,
    ...inputProps
}: FormFieldProps) => {
    return (
        <Field className={className ?? 'space-y-1'}>
            <Label
                htmlFor={inputProps.id}
                className={labelClassName ?? 'label text-sm font-semibold text-base-content'}
            >
                {label}
            </Label>

            <input
                {...inputProps}
                className={
                    inputClassName ?? `input h-11 w-full text-base ${error ? 'input-error' : ''}`
                }
            />

            {error ? (
                <Description className={hintClassName ?? 'text-xs text-error'}>{error}</Description>
            ) : hint ? (
                <Description className={hintClassName ?? 'text-xs text-[var(--color-muted)]'}>
                    {hint}
                </Description>
            ) : null}
        </Field>
    );
};

export default FormField;
