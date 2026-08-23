import { z } from 'zod';

export const loginSchema = z.object({
   username: z.string().min(1, 'Username is required'),
   password: z.string().min(1, 'Password is required'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z
   .object({
      username: z
         .string()
         .min(3, 'Username must be at least 3 characters')
         .max(20, 'Username must be at most 20 characters'),
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      email: z.string().email('Invalid email address'),
      dateOfBirth: z.string().min(1, 'Date of birth is required'),
      password: z
         .string()
         .min(8, 'Password must be at least 8 characters')
         .regex(/[A-Z]/, 'Password must contain an uppercase letter')
         .regex(/[a-z]/, 'Password must contain a lowercase letter')
         .regex(/[0-9]/, 'Password must contain a number'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
   })
   .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords must match',
      path: ['confirmPassword'],
   });

export type RegisterSchema = z.infer<typeof registerSchema>;
