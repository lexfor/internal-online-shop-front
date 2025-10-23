import {
  EMAIL_MAX_LENGTH,
  EMAIL_REGEX,
  FULL_NAME_MAX_LENGTH,
  FULL_NAME_MIN_LENGTH,
  FULL_NAME_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from '../constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];

  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }

  if (!EMAIL_REGEX.test(email)) {
    errors.push('Please enter a valid email address');
  }

  if (email.length > EMAIL_MAX_LENGTH) {
    errors.push('Email address is too long');
  }

  if (email.includes('..')) {
    errors.push('Email cannot contain consecutive dots');
  }

  if (email.startsWith('.') || email.endsWith('.')) {
    errors.push('Email cannot start or end with a dot');
  }

  return { isValid: errors.length === 0, errors };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  const requirements = {
    upperCase: /[A-Z]/,
    lowerCase: /[a-z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*(),.?":{}|<>]/,
  };

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
    );
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(
      `Password must be no more than ${PASSWORD_MAX_LENGTH} characters long`
    );
  }

  if (!requirements.upperCase.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!requirements.lowerCase.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!requirements.number.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!requirements.special.test(password)) {
    errors.push('Password must contain at least one special character');
  }

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

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Please choose a more secure password');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateUsername = (username: string): ValidationResult => {
  const errors: string[] = [];

  if (!username) {
    errors.push('Username is required');
    return { isValid: false, errors };
  }

  if (username.length < USERNAME_MIN_LENGTH) {
    errors.push(
      `Username must be at least ${USERNAME_MIN_LENGTH} characters long`
    );
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    errors.push(
      `Username must be no more than ${USERNAME_MAX_LENGTH} characters long`
    );
  }

  if (!USERNAME_REGEX.test(username)) {
    errors.push(
      'Username can only contain letters, numbers, underscores, and hyphens'
    );
  }

  if (username.startsWith('_') || username.startsWith('-')) {
    errors.push('Username cannot start with an underscore or hyphen');
  }

  if (username.endsWith('_') || username.endsWith('-')) {
    errors.push('Username cannot end with an underscore or hyphen');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateFullName = (fullName: string): ValidationResult => {
  const errors: string[] = [];

  if (!fullName) {
    errors.push('Full name is required');
    return { isValid: false, errors };
  }

  if (fullName.length < FULL_NAME_MIN_LENGTH) {
    errors.push(
      `Full name must be at least ${FULL_NAME_MIN_LENGTH} characters long`
    );
  }

  if (fullName.length > FULL_NAME_MAX_LENGTH) {
    errors.push(
      `Full name must be no more than ${FULL_NAME_MAX_LENGTH} characters long`
    );
  }

  if (!FULL_NAME_REGEX.test(fullName)) {
    errors.push(
      'Full name can only contain letters, spaces, apostrophes, and hyphens'
    );
  }

  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length < 2) {
    errors.push('Please enter both first and last name');
  }

  const hasShortNames = nameParts.some(part => part.length < 1);
  if (hasShortNames) {
    errors.push('Each name must be at least 1 character long');
  }

  return { isValid: errors.length === 0, errors };
};

export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  const errors: string[] = [];

  if (!confirmPassword) {
    errors.push('Please confirm your password');
    return { isValid: false, errors };
  }

  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  return { isValid: errors.length === 0, errors };
};
