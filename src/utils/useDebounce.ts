import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debounced validation
 * @param value - The value to validate
 * @param validationFn - The validation function
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns Object with validation results and loading state
 */
export function useValidationDebounce(
  value: string,
  validationFn: (value: string) => string[],
  delay: number = 500
) {
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const debouncedValue = useDebounce(value, delay);

  useEffect(() => {
    if (!debouncedValue) {
      setErrors([]);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    const validationErrors = validationFn(debouncedValue);
    setErrors(validationErrors);
    setIsValidating(false);
  }, [debouncedValue, validationFn]);

  // Show validation state only after user has started typing
  const shouldShowValidation = value.length > 0;

  return {
    errors: shouldShowValidation ? errors : [],
    isValidating: shouldShowValidation && isValidating,
    hasErrors: shouldShowValidation && errors.length > 0,
    isValid: shouldShowValidation && errors.length === 0,
  };
}
