import PrimaryButton from "@/components/auth/components/PrimaryButton";
import ScreenShell from "@/components/auth/components/ScreenShell";

export default function AllSetScreen({onStart}: { onStart: () => void }) {
    return (
        <ScreenShell
            centered
            title="You're all set!"
            subtitle="You're now ready to book your appointment."
        >
            <PrimaryButton onClick={onStart}>Start booking</PrimaryButton>
        </ScreenShell>
    );
}
