import type { z } from 'zod';
import { registerFields, type RegisterSchema } from './schemas';

interface RegisterStep {
    name: string;
    title: string;
    subtitle: string;
    /** The slice of the register schema this step collects. */
    schema: z.ZodObject;
    fields: readonly (keyof RegisterSchema)[];
}

const defineStep = (step: Omit<RegisterStep, 'fields'>): RegisterStep => ({
    ...step,
    fields: Object.keys(step.schema.shape) as (keyof RegisterSchema)[],
});

export const registerSteps: readonly RegisterStep[] = [
    defineStep({
        name: 'Account',
        title: 'Create your account',
        subtitle: 'Choose how you will sign in.',
        schema: registerFields.pick({ username: true, email: true }),
    }),
    defineStep({
        name: 'Personal details',
        title: 'About you',
        subtitle: 'Tell us a little about yourself.',
        schema: registerFields.pick({ firstName: true, lastName: true, dateOfBirth: true }),
    }),
    defineStep({
        name: 'Password',
        title: 'Secure your account',
        subtitle: 'Pick a strong password.',
        schema: registerFields.pick({ password: true, confirmPassword: true }),
    }),
];

export const lastRegisterStepIndex = registerSteps.length - 1;

/** The step a field belongs to, so an error can open the step that owns it. */
export const stepIndexForField = (field: keyof RegisterSchema) =>
    registerSteps.findIndex((step) => step.fields.includes(field));

/** The earliest step owning any of `fields`, or `null` when none of them do. */
export const earliestStepForFields = (fields: readonly (keyof RegisterSchema)[]) => {
    const indexes = fields.map(stepIndexForField).filter((index) => index >= 0);
    return indexes.length ? Math.min(...indexes) : null;
};
