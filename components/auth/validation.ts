import type {Draft} from "@/components/auth/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type GuestErrors = Partial<Record<keyof Draft, string>>;

export function validateEmail(email: string): string | undefined {
    const value = email.trim();
    if (!value) return "Email address is required.";
    if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address, like name@example.com.";
    return undefined;
}

const PHONE_PATTERN = /^\+?[0-9\s-]{7,20}$/;

export function validatePhone(phone: string): string | undefined {
    const value = phone.trim();
    if (!value) return "Phone number is required.";
    if (!PHONE_PATTERN.test(value)) return "Enter a valid phone number, like +27821234567.";
    return undefined;
}

export function validatePassword(password: string): string | undefined {
    return password ? undefined : "Password is required.";
}

export function validateGuest(values: Draft): GuestErrors {
    const errors: GuestErrors = {};
    if (!values.firstName.trim()) errors.firstName = "First name is required.";
    if (!values.lastName.trim()) errors.lastName = "Last name is required.";
    const emailError = validateEmail(values.email);
    if (emailError) errors.email = emailError;
    const phoneError = validatePhone(values.phone);
    if (phoneError) errors.phone = phoneError;
    return errors;
}
