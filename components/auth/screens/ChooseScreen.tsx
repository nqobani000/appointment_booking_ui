import {Box} from "@mui/material";
import OptionCard from "@/components/auth/components/OptionCard";
import ScreenShell from "@/components/auth/components/ScreenShell";

export default function ChooseScreen({
                                         onClient,
                                         onGuest,
                                     }: {
    onClient: () => void;
    onGuest: () => void;
}) {
    return (
        <ScreenShell
            centered
            maxWidth={760}
            gap={5}
            title="How do you wish to continue?"
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {xs: "1fr", sm: "1fr 1fr"},
                    gridAutoRows: "1fr",
                    gap: 3,
                }}
            >
                <OptionCard
                    id="existing-client"
                    title="Existing client"
                    description="Log in with your email"
                    ariaLabel="Continue as an existing client"
                    onClick={onClient}
                />
                <OptionCard
                    id="guest"
                    title="Continue as a guest"
                    description="Book without an account"
                    ariaLabel="Continue as a guest"
                    onClick={onGuest}
                />
            </Box>
        </ScreenShell>
    );
}
