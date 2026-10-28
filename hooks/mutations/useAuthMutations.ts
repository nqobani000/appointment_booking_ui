import {useMutation} from "@tanstack/react-query";
import {login, requestGuestCode, verifyGuestCode} from "@/api/auth";

// gcTime 0: variables (password) and results (access token) must not linger in the mutation cache.
export const useLogin = () => useMutation({mutationFn: login, gcTime: 0});
export const useRequestGuestCode = () => useMutation({mutationFn: requestGuestCode, gcTime: 0});
export const useVerifyGuestCode = () => useMutation({mutationFn: verifyGuestCode, gcTime: 0});
