import React, { useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { AuthActivityType, AuthFormProps } from '../../types/auth';
import { AuthFormDto } from './AuthFormDto';
import { useFormValidation } from '../../utils/useFormValidation';

export default function AuthForm({
  type,
  onSubmit,
  isLoading,
  error,
}: AuthFormProps) {
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Use the new form validation hook
  const {
    formState,
    setFieldValue,
    setFieldTouched,
    validateForm,
    getFieldError,
    getFieldHelperText,
  } = useFormValidation({ type });

  // Handle field blur to mark as touched
  const handleFieldBlur = (fieldName: keyof typeof formState) => {
    setFieldTouched(fieldName, true);
  };

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the entire form
    if (!validateForm()) return;

    // Create the form data for submission
    const formDto = AuthFormDto.create({
      email: formState.email.value,
      password: formState.password.value,
      confirmPassword: formState.confirmPassword.value,
      username: formState.username.value,
      fullName: formState.fullName.value,
      type,
    });

    onSubmit(formDto.toSubmitData());
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
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
        <TextField
          inputRef={emailInputRef}
          label="Email Address"
          variant="outlined"
          type="email"
          fullWidth
          required
          value={formState.email.value}
          onChange={e => setFieldValue('email', e.target.value)}
          onBlur={() => handleFieldBlur('email')}
          error={getFieldError('email')}
          helperText={getFieldHelperText('email')}
          placeholder="Enter your email address"
          autoComplete="email"
          inputProps={{
            'aria-describedby': 'email-helper-text',
            'aria-invalid': getFieldError('email'),
          }}
          FormHelperTextProps={{
            id: 'email-helper-text',
            role: 'alert',
          }}
        />

        <Box>
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            required
            value={formState.password.value}
            onChange={e => setFieldValue('password', e.target.value)}
            onBlur={() => handleFieldBlur('password')}
            error={getFieldError('password')}
            helperText={getFieldHelperText('password')}
            placeholder="Enter your password"
            autoComplete={
              type === AuthActivityType.SIGN_IN
                ? 'current-password'
                : 'new-password'
            }
            inputProps={{
              'aria-describedby': 'password-helper-text password-strength',
              'aria-invalid': getFieldError('password'),
            }}
            FormHelperTextProps={{
              id: 'password-helper-text',
              role: 'alert',
            }}
          />
        </Box>

        {type === AuthActivityType.SIGN_UP && (
          <>
            <TextField
              label="Confirm Password"
              variant="outlined"
              type="password"
              fullWidth
              required
              value={formState.confirmPassword.value}
              onChange={e => setFieldValue('confirmPassword', e.target.value)}
              onBlur={() => handleFieldBlur('confirmPassword')}
              error={getFieldError('confirmPassword')}
              helperText={getFieldHelperText('confirmPassword')}
              placeholder="Confirm your password"
              autoComplete="new-password"
              inputProps={{
                'aria-describedby': 'confirm-password-helper-text',
                'aria-invalid': getFieldError('confirmPassword'),
              }}
              FormHelperTextProps={{
                id: 'confirm-password-helper-text',
                role: 'alert',
              }}
            />

            <TextField
              label="Username"
              variant="outlined"
              type="text"
              fullWidth
              required
              value={formState.username.value}
              onChange={e => setFieldValue('username', e.target.value)}
              onBlur={() => handleFieldBlur('username')}
              error={getFieldError('username')}
              helperText={
                getFieldHelperText('username') ||
                'Choose a unique username (3-30 characters, letters, numbers, _, -)'
              }
              placeholder="Choose a username"
              autoComplete="username"
              inputProps={{
                'aria-describedby': 'username-helper-text',
                'aria-invalid': getFieldError('username'),
                maxLength: 30,
              }}
              FormHelperTextProps={{
                id: 'username-helper-text',
                role: getFieldError('username') ? 'alert' : 'status',
              }}
            />

            <TextField
              label="Full Name"
              variant="outlined"
              type="text"
              fullWidth
              required
              value={formState.fullName.value}
              onChange={e => setFieldValue('fullName', e.target.value)}
              onBlur={() => handleFieldBlur('fullName')}
              error={getFieldError('fullName')}
              helperText={
                getFieldHelperText('fullName') ||
                'Enter your first and last name'
              }
              placeholder="Enter your full name"
              autoComplete="name"
              inputProps={{
                'aria-describedby': 'full-name-helper-text',
                'aria-invalid': getFieldError('fullName'),
                maxLength: 100,
              }}
              FormHelperTextProps={{
                id: 'full-name-helper-text',
                role: getFieldError('fullName') ? 'alert' : 'status',
              }}
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
