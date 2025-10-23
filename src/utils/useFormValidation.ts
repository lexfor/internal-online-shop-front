import { useState, useCallback, useMemo, useEffect } from 'react';
import { AuthActivityType } from '../types/auth';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateFullName,
  validatePasswordConfirmation,
} from './validation';

export interface FormField {
  value: string;
  errors: string[];
  touched: boolean;
  isValidating: boolean;
}

export interface FormState {
  email: FormField;
  password: FormField;
  confirmPassword: FormField;
  username: FormField;
  fullName: FormField;
}

export interface UseFormValidationOptions {
  type: AuthActivityType;
  debounceDelay?: number;
}

export interface UseFormValidationReturn {
  formState: FormState;
  isValid: boolean;
  hasErrors: boolean;
  setFieldValue: (fieldName: keyof FormState, value: string) => void;
  setFieldTouched: (fieldName: keyof FormState, touched?: boolean) => void;
  validateField: (fieldName: keyof FormState, value?: string) => string[];
  validateForm: () => boolean;
  resetForm: () => void;
  getFieldError: (fieldName: keyof FormState) => boolean;
  getFieldHelperText: (fieldName: keyof FormState) => string;
}

const initialFormState: FormState = {
  email: { value: '', errors: [], touched: false, isValidating: false },
  password: { value: '', errors: [], touched: false, isValidating: false },
  confirmPassword: {
    value: '',
    errors: [],
    touched: false,
    isValidating: false,
  },
  username: { value: '', errors: [], touched: false, isValidating: false },
  fullName: { value: '', errors: [], touched: false, isValidating: false },
};

export const useFormValidation = ({
  type,
  debounceDelay = 300,
}: UseFormValidationOptions): UseFormValidationReturn => {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [validationTimeouts, setValidationTimeouts] = useState<
    Record<string, any>
  >({});

  // Memoized validation functions
  const validationFunctions = useMemo(
    () => ({
      email: validateEmail,
      password: validatePassword,
      username: validateUsername,
      fullName: validateFullName,
      confirmPassword: (value: string) =>
        validatePasswordConfirmation(formState.password.value, value),
    }),
    [formState.password.value]
  );

  // Debounced validation function
  const debouncedValidate = useCallback(
    (
      fieldName: keyof FormState,
      value: string,
      validationFn: (value: string) => { isValid: boolean; errors: string[] }
    ) => {
      // Clear existing timeout for this field
      if (validationTimeouts[fieldName]) {
        clearTimeout(validationTimeouts[fieldName]);
      }

      // Set validating state
      setFormState(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          isValidating: true,
        },
      }));

      // Set new timeout
      const timeout = setTimeout(() => {
        const result = validationFn(value);
        setFormState(prev => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            errors: result.errors,
            isValidating: false,
          },
        }));

        // Clean up timeout reference
        setValidationTimeouts(prev => {
          const newTimeouts = { ...prev };
          delete newTimeouts[fieldName];
          return newTimeouts;
        });
      }, debounceDelay);

      setValidationTimeouts(prev => ({
        ...prev,
        [fieldName]: timeout,
      }));
    },
    [debounceDelay, validationTimeouts]
  );

  // Set field value with debounced validation
  const setFieldValue = useCallback(
    (fieldName: keyof FormState, value: string) => {
      setFormState(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value,
        },
      }));

      // Only validate if field is touched or has a value
      if (formState[fieldName].touched || value.length > 0) {
        const validationFn = validationFunctions[fieldName];
        if (validationFn) {
          debouncedValidate(fieldName, value, validationFn);
        }
      }
    },
    [formState, validationFunctions, debouncedValidate]
  );

  // Set field touched state
  const setFieldTouched = useCallback(
    (fieldName: keyof FormState, touched = true) => {
      setFormState(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          touched,
        },
      }));

      // Validate immediately when field is touched
      if (touched) {
        const field = formState[fieldName];
        const validationFn = validationFunctions[fieldName];
        if (validationFn && field.value) {
          const result = validationFn(field.value);
          setFormState(prev => ({
            ...prev,
            [fieldName]: {
              ...prev[fieldName],
              errors: result.errors,
              isValidating: false,
            },
          }));
        }
      }
    },
    [formState, validationFunctions]
  );

  // Validate specific field
  const validateField = useCallback(
    (fieldName: keyof FormState, value?: string): string[] => {
      const fieldValue = value ?? formState[fieldName].value;
      const validationFn = validationFunctions[fieldName];

      if (!validationFn) return [];

      const result = validationFn(fieldValue);
      return result.errors;
    },
    [formState, validationFunctions]
  );

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    // Mark all fields as touched
    setFormState(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key as keyof FormState] = {
          ...newState[key as keyof FormState],
          touched: true,
        };
      });
      return newState;
    });

    // Validate email
    const emailValidation = validateEmail(formState.email.value);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors;
      isValid = false;
    }

    // Validate password
    const passwordValidation = validatePassword(formState.password.value);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors;
      isValid = false;
    }

    // Validate sign-up specific fields
    if (type === AuthActivityType.SIGN_UP) {
      // Validate confirm password
      const confirmPasswordValidation = validatePasswordConfirmation(
        formState.password.value,
        formState.confirmPassword.value
      );
      if (!confirmPasswordValidation.isValid) {
        errors.confirmPassword = confirmPasswordValidation.errors;
        isValid = false;
      }

      // Validate username
      const usernameValidation = validateUsername(formState.username.value);
      if (!usernameValidation.isValid) {
        errors.username = usernameValidation.errors;
        isValid = false;
      }

      // Validate full name
      const fullNameValidation = validateFullName(formState.fullName.value);
      if (!fullNameValidation.isValid) {
        errors.fullName = fullNameValidation.errors;
        isValid = false;
      }
    }

    // Update form state with errors
    setFormState(prev => {
      const newState = { ...prev };
      Object.keys(errors).forEach(key => {
        newState[key as keyof FormState] = {
          ...newState[key as keyof FormState],
          errors: errors[key],
        };
      });
      return newState;
    });

    return isValid;
  }, [formState, type]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    // Clear all timeouts
    Object.values(validationTimeouts).forEach(timeout => clearTimeout(timeout));
    setValidationTimeouts({});
    setFormState(initialFormState);
  }, [validationTimeouts]);

  // Get field error state
  const getFieldError = useCallback(
    (fieldName: keyof FormState): boolean => {
      const field = formState[fieldName];
      return field.touched && field.errors.length > 0;
    },
    [formState]
  );

  // Get field helper text
  const getFieldHelperText = useCallback(
    (fieldName: keyof FormState): string => {
      const field = formState[fieldName];
      if (field.touched && field.errors.length > 0) {
        return field.errors[0]; // Show first error
      }
      return '';
    },
    [formState]
  );

  // Calculate form validity
  const isValid = useMemo(() => {
    const requiredFields =
      type === AuthActivityType.SIGN_UP
        ? ([
            'email',
            'password',
            'confirmPassword',
            'username',
            'fullName',
          ] as const)
        : (['email', 'password'] as const);

    return requiredFields.every(fieldName => {
      const field = formState[fieldName];
      return field.value.length > 0 && field.errors.length === 0;
    });
  }, [formState, type]);

  // Calculate if form has any errors
  const hasErrors = useMemo(() => {
    return Object.values(formState).some(field => field.errors.length > 0);
  }, [formState]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimeouts).forEach(timeout =>
        clearTimeout(timeout)
      );
    };
  }, [validationTimeouts]);

  return {
    formState,
    isValid,
    hasErrors,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    getFieldError,
    getFieldHelperText,
  };
};
