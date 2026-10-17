import { z } from 'zod';

export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const minimumAgeYears = 19;

const isOldEnough = (value: string) => {
    const dateOfBirth = new Date(value);
    if (Number.isNaN(dateOfBirth.getTime())) return false;

    const comingOfAge = new Date(
        dateOfBirth.getFullYear() + minimumAgeYears,
        dateOfBirth.getMonth(),
        dateOfBirth.getDate(),
    );

    return comingOfAge <= new Date();
};

export const registerFields = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(64, 'Username must be at most 64 characters')
        .regex(
            /^[A-Za-z0-9._-]+$/,
            'Username can only contain letters, numbers, dots, underscores and hyphens',
        ),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.email('Invalid email address'),
    dateOfBirth: z
        .string()
        .min(1, 'Date of birth is required')
        .refine(isOldEnough, `You must be at least ${minimumAgeYears} years old to register`),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[0-9]/, 'Password must contain a number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
});

export const registerSchema = registerFields.refine(
    (data) => data.password === data.confirmPassword,
    {
        message: 'Passwords must match',
        path: ['confirmPassword'],
    },
);

export type RegisterSchema = z.infer<typeof registerSchema>;
