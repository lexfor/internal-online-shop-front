import { z } from 'zod';
import {
  EMAIL_MAX_LENGTH,
  EMAIL_REGEX,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_REGEX,
  FULL_NAME_MIN_LENGTH,
  FULL_NAME_MAX_LENGTH,
  FULL_NAME_REGEX,
} from '../constants';

// Common passwords list for blacklist validation
const commonPasswords = [
  'password',
  '123456',
  '123456789',
  'qwerty',
  'abc123',
  'password123',
  'admin',
  'letmein',
  'welcome',
  'monkey',
];

// Base schemas using Zod's built-in validators
// Using regex for email validation (Zod v4: .email() is deprecated on z.string())
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .max(EMAIL_MAX_LENGTH, 'Email address is too long')
  .regex(EMAIL_REGEX, 'Please enter a valid email address')
  .refine(email => !email.includes('..'), {
    message: 'Email cannot contain consecutive dots',
  })
  .refine(email => !email.startsWith('.') && !email.endsWith('.'), {
    message: 'Email cannot start or end with a dot',
  });

const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must be no more than ${PASSWORD_MAX_LENGTH} characters long`
  )
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    'Password must contain at least one special character'
  )
  .refine(password => !commonPasswords.includes(password.toLowerCase()), {
    message: 'Please choose a more secure password',
  });

// Sign In Schema
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Sign Up Schema
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    username: z
      .string()
      .min(
        USERNAME_MIN_LENGTH,
        `Username must be at least ${USERNAME_MIN_LENGTH} characters long`
      )
      .max(
        USERNAME_MAX_LENGTH,
        `Username must be no more than ${USERNAME_MAX_LENGTH} characters long`
      )
      .regex(
        USERNAME_REGEX,
        'Username can only contain letters, numbers, underscores, and hyphens'
      )
      .refine(
        username => !username.startsWith('_') && !username.startsWith('-'),
        {
          message: 'Username cannot start with an underscore or hyphen',
        }
      )
      .refine(username => !username.endsWith('_') && !username.endsWith('-'), {
        message: 'Username cannot end with an underscore or hyphen',
      }),
    fullName: z
      .string()
      .min(
        FULL_NAME_MIN_LENGTH,
        `Full name must be at least ${FULL_NAME_MIN_LENGTH} characters long`
      )
      .max(
        FULL_NAME_MAX_LENGTH,
        `Full name must be no more than ${FULL_NAME_MAX_LENGTH} characters long`
      )
      .regex(
        FULL_NAME_REGEX,
        'Full name can only contain letters, spaces, apostrophes, and hyphens'
      )
      .refine(
        fullName => {
          const nameParts = fullName.trim().split(/\s+/);
          return nameParts.length >= 2;
        },
        {
          message: 'Please enter both first and last name',
        }
      )
      .refine(
        fullName => {
          const nameParts = fullName.trim().split(/\s+/);
          return !nameParts.some(part => part.length < 1);
        },
        {
          message: 'Each name must be at least 1 character long',
        }
      ),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Type inference from schemas
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
