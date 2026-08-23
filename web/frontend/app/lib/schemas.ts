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

export const updateUsernameSchema = z.object({
   newUsername: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(64, 'Username must be at most 64 characters')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Only letters, numbers, dots, underscores, and hyphens'),
});

export type UpdateUsernameSchema = z.infer<typeof updateUsernameSchema>;

export const updateEmailSchema = z.object({
   newEmail: z.string().email('Invalid email address').max(128, 'Email is too long'),
});

export type UpdateEmailSchema = z.infer<typeof updateEmailSchema>;

export const updateProfileSchema = z.object({
   firstName: z.string().min(1, 'First name is required').max(128, 'First name is too long'),
   lastName: z.string().min(1, 'Last name is required').max(128, 'Last name is too long'),
   dateOfBirth: z.string().min(1, 'Date of birth is required'),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const updatePasswordSchema = z
   .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z
         .string()
         .min(8, 'Password must be at least 8 characters')
         .regex(/[A-Z]/, 'Password must contain an uppercase letter')
         .regex(/[a-z]/, 'Password must contain a lowercase letter')
         .regex(/[0-9]/, 'Password must contain a number')
         .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character'),
      confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
   })
   .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: 'Passwords must match',
      path: ['confirmNewPassword'],
   })
   .refine((data) => data.newPassword !== data.currentPassword, {
      message: 'New password must be different from the current password',
      path: ['newPassword'],
   });

export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
