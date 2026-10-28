"use client";

import * as React from "react";
import {AuthProvider, useAuth} from "@/components/auth/AuthContext";
import AllSetScreen from "@/components/auth/screens/AllSetScreen";
import ClientLoginScreen from "@/components/auth/screens/ClientLoginScreen";
import GuestDetailsScreen from "@/components/auth/screens/GuestDetailsScreen";
import IndexScreen from "@/components/auth/screens/IndexScreen";
import VerifyScreen from "@/components/auth/screens/VerifyScreen";
import type {Draft, Step} from "@/components/auth/types";
import {toSession} from "@/components/auth/session";

const EMPTY_DRAFT: Draft = {firstName: "", lastName: "", email: "", phone: ""};

function GateContent({children}: { children: React.ReactNode }) {
    const {session, signIn} = useAuth();
    const [step, setStep] = React.useState<Step>({name: "choose"});
    const [draft, setDraft] = React.useState<Draft>(EMPTY_DRAFT);
    const [started, setStarted] = React.useState(false);

    if (session && started) return <>{children}</>;
    if (session) return <AllSetScreen onStart={() => setStarted(true)}/>;

    switch (step.name) {
        case "choose":
            return (
                <IndexScreen
                    onClient={() => setStep({name: "client-login"})}
                    onGuest={() => setStep({name: "guest-details"})}
                />
            );

        case "client-login":
            return (
                <ClientLoginScreen
                    onBack={() => setStep({name: "choose"})}
                    onLoggedIn={(token, email) => signIn(toSession(token, {email}))}
                />
            );

        case "guest-details":
            return (
                <GuestDetailsScreen
                    initial={draft}
                    onBack={() => setStep({name: "choose"})}
                    onCodeSent={(values) => {
                        setDraft(values);
                        setStep({name: "verify"});
                    }}
                />
            );

        case "verify":
            return (
                <VerifyScreen
                    draft={draft}
                    onBack={() => setStep({name: "guest-details"})}
                    onVerified={(token) =>
                        signIn(toSession(token, {email: draft.email, firstName: draft.firstName, lastName: draft.lastName}))
                    }
                />
            );
    }
}

export default function AuthGate({children}: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <GateContent>{children}</GateContent>
        </AuthProvider>
    );
}