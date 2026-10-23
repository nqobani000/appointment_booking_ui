import type {ServiceGroup} from "@/components/service_selection/ServiceOptionGroups";

export const MOCK_GROUPS: ServiceGroup[] = [
    {
        id: "accounts-cards",
        title: "Accounts & cards",
        options: [
            {
                id: "open-account",
                title: "Open an account",
                description: "Open a new personal or business account",
            },
            {
                id: "replace-card",
                title: "Replace a bank card",
                description: "Lost, stolen or damaged card",
            },
            {
                id: "update-details",
                title: "Update personal details",
                description: "Change your contact information",
            },
        ],
    },
    {
        id: "payments-transfers",
        title: "Payments & transfers",
        options: [
            {
                id: "cash-and-cheque-services",
                title: "Cash and cheque services",
                description: "Branch-assisted cash or cheque queries",
            },
            {
                id: "proof-of-payment",
                title: "Proof of payment",
                description: "Get help with a payment",
            },
        ],
    },
    {
        id: "lending",
        title: "Lending",
        options: [
            {
                id: "home-loans",
                title: "Home loans",
                description: "Buy, refinance or top up",
            },
            {
                id: "vehicle-finance",
                title: "Vehicle finance",
                description: "Finance a new or used vehicle",
            },
        ],
    },
];