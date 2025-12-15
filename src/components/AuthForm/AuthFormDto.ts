import { AuthActivityType } from '../../types/auth';

export class AuthFormDto {
  email!: string;
  password!: string;
  username?: string;
  fullName?: string;
  confirmPassword?: string;
  type!: AuthActivityType;

  constructor(data: Partial<AuthFormDto> = {}) {
    Object.assign(this, data);
  }

  static create(data: Partial<AuthFormDto>): AuthFormDto {
    return new AuthFormDto(data);
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
