import type {CustomerType, IsoTimestamp, Uuid} from "@/api/types/common";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface GuestCodeRequest {
    name: string;
    surname: string;
    email: string;
    phone: string;
}

export interface GuestCodeResponse {
    message: string;
    expiresAt: IsoTimestamp;
}

export interface GuestVerifyRequest {
    email: string;
    code: string;
}

export interface AuthTokenResponse {
    accessToken: string;
    tokenType: "Bearer";
    expiresAt: IsoTimestamp;
    customerId: Uuid;
    customerType: CustomerType;
}
