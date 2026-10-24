"use client";

import * as React from "react";
import {AuthProvider, useAuth} from "@/components/auth/AuthContext";
import AllSetScreen from "@/components/auth/screens/AllSetScreen";
import ChooseScreen from "@/components/auth/screens/ChooseScreen";
import ClientEmailScreen from "@/components/auth/screens/ClientEmailScreen";
import GuestDetailsScreen from "@/components/auth/screens/GuestDetailsScreen";
import VerifyScreen from "@/components/auth/screens/VerifyScreen";
import type {Draft, Step} from "@/components/auth/types";

const EMPTY_DRAFT: Draft = {firstName: "", lastName: "", email: ""};

function GateContent({children}: { children: React.ReactNode }) {
    const {session, ready, signIn} = useAuth();
    const [step, setStep] = React.useState<Step>({name: "choose"});
    const [draft, setDraft] = React.useState<Draft>(EMPTY_DRAFT);
    const [started, setStarted] = React.useState(false);

    if (!ready) return null;
    if (session && started) return <>{children}</>;
    if (session) return <AllSetScreen onStart={() => setStarted(true)}/>;

    switch (step.name) {
        case "choose":
            return (
                <ChooseScreen
                    onClient={() => setStep({name: "client-email"})}
                    onGuest={() => setStep({name: "guest-details"})}
                />
            );

        case "client-email":
            return (
                <ClientEmailScreen
                    initialEmail={draft.email}
                    onBack={() => setStep({name: "choose"})}
                    onCodeSent={(email) => {
                        setDraft((d) => ({...d, email}));
                        setStep({name: "verify", flow: "client"});
                    }}
                />
            );

        case "guest-details":
            return (
                <GuestDetailsScreen
                    initial={draft}
                    onBack={() => setStep({name: "choose"})}
                    onCodeSent={(values) => {
                        setDraft(values);
                        setStep({name: "verify", flow: "guest"});
                    }}
                />
            );

        case "verify":
            return (
                <VerifyScreen
                    email={draft.email}
                    onBack={() =>
                        setStep(step.flow === "guest" ? {name: "guest-details"} : {name: "client-email"})
                    }
                    onVerified={() =>
                        signIn(
                            step.flow === "guest"
                                ? {
                                    kind: "guest",
                                    email: draft.email,
                                    firstName: draft.firstName,
                                    lastName: draft.lastName,
                                }
                                : {kind: "client", email: draft.email}
                        )
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