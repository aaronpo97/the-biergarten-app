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
            <Label htmlFor={inputProps.id} className={labelClassName ?? 'label font-medium'}>
                {label}
            </Label>

            <input
                {...inputProps}
                className={inputClassName ?? `input w-full ${error ? 'input-error' : ''}`}
            />

            {error ? (
                <Description className={hintClassName ?? 'label text-error'}>{error}</Description>
            ) : hint ? (
                <Description className={hintClassName ?? 'label'}>{hint}</Description>
            ) : null}
        </Field>
    );
};

export default FormField;
