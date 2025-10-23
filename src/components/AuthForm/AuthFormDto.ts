import { AuthActivityType } from '../../types/auth';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateFullName,
  validatePasswordConfirmation,
} from '../../utils/validation';

export class AuthFormDto {
  email!: string;
  password!: string;
  username?: string;
  fullName?: string;
  confirmPassword?: string;
  type!: AuthActivityType;
  setValidationErrors?: (errors: Record<string, string | string[]>) => void;

  constructor(data: Partial<AuthFormDto> = {}) {
    Object.assign(this, data);
  }

  static create(data: Partial<AuthFormDto>): AuthFormDto {
    return new AuthFormDto(data);
  }

  validate(): boolean {
    const errors: Record<string, string | string[]> = {};

    // Email validation
    const emailValidation = validateEmail(this.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors;
    }

    // Password validation
    const passwordValidation = validatePassword(this.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors;
    }

    if (this.type === AuthActivityType.SIGN_UP) {
      // Password confirmation validation
      const confirmPasswordValidation = validatePasswordConfirmation(
        this.password,
        this.confirmPassword || ''
      );
      if (!confirmPasswordValidation.isValid) {
        errors.confirmPassword = confirmPasswordValidation.errors;
      }

      // Username validation
      const usernameValidation = validateUsername(this.username || '');
      if (!usernameValidation.isValid) {
        errors.username = usernameValidation.errors;
      }

      // Full name validation
      const fullNameValidation = validateFullName(this.fullName || '');
      if (!fullNameValidation.isValid) {
        errors.fullName = fullNameValidation.errors;
      }
    }

    this.setValidationErrors?.(errors);
    return Object.keys(errors).length === 0;
  }

  // Method for real-time field validation
  validateField(fieldName: string, value: string): string[] {
    switch (fieldName) {
      case 'email':
        return validateEmail(value).errors;
      case 'password':
        return validatePassword(value).errors;
      case 'confirmPassword':
        return validatePasswordConfirmation(this.password, value).errors;
      case 'username':
        return validateUsername(value).errors;
      case 'fullName':
        return validateFullName(value).errors;
      default:
        return [];
    }
  }

  toSubmitData() {
    const baseData = {
      email: this.email,
      password: this.password,
    };

    if (this.type === AuthActivityType.SIGN_UP) {
      return {
        ...baseData,
        username: this.username,
        fullName: this.fullName,
      };
    }

    return baseData;
  }
}
