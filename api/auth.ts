import {request} from "@/api/client";
import type {AuthTokenResponse, GuestCodeRequest, GuestCodeResponse, GuestVerifyRequest, LoginRequest} from "@/api/types/auth";

export const login = (body: LoginRequest) =>
    request<AuthTokenResponse>("/api/auth/login", {method: "POST", body});

export const requestGuestCode = (body: GuestCodeRequest) =>
    request<GuestCodeResponse>("/api/auth/guests/code", {method: "POST", body});

export const verifyGuestCode = (body: GuestVerifyRequest) =>
    request<AuthTokenResponse>("/api/auth/guests/verify", {method: "POST", body});
