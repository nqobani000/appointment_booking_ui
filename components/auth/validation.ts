import type {Draft} from "@/components/auth/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type GuestErrors = Partial<Record<keyof Draft, string>>;

export function validateEmail(email: string): string | undefined {
    const value = email.trim();
    if (!value) return "Email address is required.";
    if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address, like name@example.com.";
    return undefined;
}

export function validateGuest(values: Draft): GuestErrors {
    const errors: GuestErrors = {};
    if (!values.firstName.trim()) errors.firstName = "First name is required.";
    if (!values.lastName.trim()) errors.lastName = "Last name is required.";
    const emailError = validateEmail(values.email);
    if (emailError) errors.email = emailError;
    return errors;
}
