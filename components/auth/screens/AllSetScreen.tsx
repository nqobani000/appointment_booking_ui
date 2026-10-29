import {Box} from "@mui/material";
import PrimaryButton from "@/components/auth/components/PrimaryButton";
import ScreenShell from "@/components/auth/components/ScreenShell";
import LogoutButton from "@/components/auth/LogoutButton";

export default function AllSetScreen({onStart, onSignOut}: { onStart: () => void; onSignOut: () => void }) {
    return (
        <ScreenShell
            centered
            title="You're all set!"
            subtitle="You're now ready to book your appointment."
        >
            <PrimaryButton onClick={onStart}>Start booking</PrimaryButton>
            <Box sx={{display: "flex", justifyContent: "center"}}>
                <LogoutButton onLogout={onSignOut}/>
            </Box>
        </ScreenShell>
    );
}
