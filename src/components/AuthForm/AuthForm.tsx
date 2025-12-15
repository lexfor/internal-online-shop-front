import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthActivityType, AuthFormProps } from '../../types/auth';
import { AuthFormDto } from './AuthFormDto';
import {
  signInSchema,
  signUpSchema,
  SignInFormData,
  SignUpFormData,
} from '../../utils/schemas';

export default function AuthForm({
  type,
  onSubmit,
  isLoading,
  error,
}: AuthFormProps) {
  // Get the appropriate schema and resolver
  const schema =
    type === AuthActivityType.SIGN_IN ? signInSchema : signUpSchema;

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues:
      type === AuthActivityType.SIGN_IN
        ? {
            email: '',
            password: '',
          }
        : {
            email: '',
            password: '',
            confirmPassword: '',
            username: '',
            fullName: '',
          },
  });

  const onSubmitForm = (data: SignInFormData | SignUpFormData) => {
    // Create the form data for submission
    const formDto = AuthFormDto.create({
      email: data.email,
      password: data.password,
      confirmPassword: 'confirmPassword' in data ? data.confirmPassword : '',
      username: 'username' in data ? data.username : '',
      fullName: 'fullName' in data ? data.fullName : '',
      type,
    });

    onSubmit(formDto.toSubmitData());
  };

  // Helper function to get error message
  const getErrorMessage = (fieldName: string) => {
    const error = errors[fieldName as keyof typeof errors];
    return error?.message || '';
  };

  // Helper function to check if field has error
  const hasError = (fieldName: string) => {
    return !!errors[fieldName as keyof typeof errors];
  };

  return (
    <Box
      component="form"
      onSubmit={handleFormSubmit(onSubmitForm)}
      sx={{
        width: '100%',
        maxWidth: 400,
        mx: 'auto',
        mt: 8,
        p: 4,
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h5" fontWeight={600} mb={2}>
        {type === AuthActivityType.SIGN_IN ? 'Sign In' : 'Sign Up'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email Address"
              variant="outlined"
              type="email"
              fullWidth
              required
              error={hasError('email')}
              helperText={getErrorMessage('email')}
              placeholder="Enter your email address"
              autoComplete="email"
              inputProps={{
                'aria-describedby': 'email-helper-text',
                'aria-invalid': hasError('email'),
              }}
              FormHelperTextProps={{
                id: 'email-helper-text',
                role: 'alert',
              }}
            />
          )}
        />

        <Box>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                required
                error={hasError('password')}
                helperText={getErrorMessage('password')}
                placeholder="Enter your password"
                autoComplete={
                  type === AuthActivityType.SIGN_IN
                    ? 'current-password'
                    : 'new-password'
                }
                inputProps={{
                  'aria-describedby': 'password-helper-text password-strength',
                  'aria-invalid': hasError('password'),
                }}
                FormHelperTextProps={{
                  id: 'password-helper-text',
                  role: 'alert',
                }}
              />
            )}
          />
        </Box>

        {type === AuthActivityType.SIGN_UP && (
          <>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirm Password"
                  variant="outlined"
                  type="password"
                  fullWidth
                  required
                  error={hasError('confirmPassword')}
                  helperText={getErrorMessage('confirmPassword')}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  inputProps={{
                    'aria-describedby': 'confirm-password-helper-text',
                    'aria-invalid': hasError('confirmPassword'),
                  }}
                  FormHelperTextProps={{
                    id: 'confirm-password-helper-text',
                    role: 'alert',
                  }}
                />
              )}
            />

            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Username"
                  variant="outlined"
                  type="text"
                  fullWidth
                  required
                  error={hasError('username')}
                  helperText={
                    getErrorMessage('username') ||
                    'Choose a unique username (3-30 characters, letters, numbers, _, -)'
                  }
                  placeholder="Choose a username"
                  autoComplete="username"
                  inputProps={{
                    'aria-describedby': 'username-helper-text',
                    'aria-invalid': hasError('username'),
                    maxLength: 30,
                  }}
                  FormHelperTextProps={{
                    id: 'username-helper-text',
                    role: hasError('username') ? 'alert' : 'status',
                  }}
                />
              )}
            />

            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  variant="outlined"
                  type="text"
                  fullWidth
                  required
                  error={hasError('fullName')}
                  helperText={
                    getErrorMessage('fullName') ||
                    'Enter your first and last name'
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  inputProps={{
                    'aria-describedby': 'full-name-helper-text',
                    'aria-invalid': hasError('fullName'),
                    maxLength: 100,
                  }}
                  FormHelperTextProps={{
                    id: 'full-name-helper-text',
                    role: hasError('fullName') ? 'alert' : 'status',
                  }}
                />
              )}
            />
          </>
        )}

        <Button
          variant="contained"
          color="primary"
          type="submit"
          fullWidth
          disabled={isLoading}
          sx={{
            height: 48,
            mt: 1,
            fontSize: '1rem',
            fontWeight: 600,
          }}
          aria-describedby={isLoading ? 'loading-status' : undefined}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              <span id="loading-status">
                {type === AuthActivityType.SIGN_IN
                  ? 'Signing In...'
                  : 'Creating Account...'}
              </span>
            </>
          ) : type === AuthActivityType.SIGN_IN ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </Button>
      </Stack>
    </Box>
  );
}
