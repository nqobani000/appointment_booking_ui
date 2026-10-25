import AppointmentBooking from "@/components/appointment_booking/AppointmentBooking";
import AuthGate from "@/components/auth/AuthGate";

export default function Home() {
    return (
        <AuthGate>
            <AppointmentBooking/>
        </AuthGate>
    );
}
