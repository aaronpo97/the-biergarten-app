import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, type FieldErrors, type Resolver } from 'react-hook-form';
import { earliestStepForFields, lastRegisterStepIndex, registerSteps } from '../registerSteps';
import { registerSchema, type RegisterSchema } from '../schemas';

const resolveRegisterSchema = zodResolver(registerSchema);

/**
 * Drives the multi-step register form: one react-hook-form instance spans every
 * step so values survive going back and forward, and each step validates its own
 * fields before the next one opens.
 */
export const useRegisterWizard = (onValid: (values: RegisterSchema) => void) => {
    const [stepIndex, setStepIndex] = useState(0);

    const currentStep = registerSteps[stepIndex];
    const isLastStep = stepIndex === lastRegisterStepIndex;

    // Every step submits through `handleSubmit`, so each one has to report only its
    // own fields: resolve the whole schema, then keep the errors this step owns. The
    // last step keeps all of them, which is also what runs the password-match
    // refinement across steps.
    const resolver: Resolver<RegisterSchema> = async (values, context, options) => {
        const result = await resolveRegisterSchema(values, context, options);
        if (isLastStep) return result;

        const errors = Object.fromEntries(
            Object.entries(result.errors).filter(([name]) =>
                currentStep.fields.includes(name as keyof RegisterSchema),
            ),
        ) as FieldErrors<RegisterSchema>;

        return Object.keys(errors).length ? { values: {}, errors } : { values, errors: {} };
    };

    const { register, handleSubmit, formState } = useForm<RegisterSchema>({
        resolver,
        mode: 'onTouched',
    });

    const onSubmit = handleSubmit(
        (values) => {
            if (isLastStep) {
                onValid(values);
                return;
            }

            setStepIndex((index) => index + 1);
        },
        // The last step validates fields from earlier steps too, so open whichever
        // step owns the problem rather than reporting it out of sight.
        (errors: FieldErrors<RegisterSchema>) => {
            const step = earliestStepForFields(Object.keys(errors) as (keyof RegisterSchema)[]);
            if (step !== null) setStepIndex(step);
        },
    );

    return {
        step: stepIndex + 1,
        totalSteps: registerSteps.length,
        name: currentStep.name,
        title: currentStep.title,
        subtitle: currentStep.subtitle,
        isLastStep,
        canGoBack: stepIndex > 0,
        back: () => setStepIndex((index) => Math.max(index - 1, 0)),
        onSubmit,
        register,
        formState,
    };
};

export type RegisterWizard = ReturnType<typeof useRegisterWizard>;
