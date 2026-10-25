export interface BookingRequest {
    branchId: string;
    branchName: string;
    serviceId: string;
    serviceTitle: string;
    date: string;
    time: string;
    agreedToNotifications: boolean;
    user: {
        kind: "client" | "guest";
        email: string;
        firstName?: string;
        lastName?: string;
    };
}

export async function createBooking(request: BookingRequest): Promise<void> {
    console.log("createBooking request", request);
}
