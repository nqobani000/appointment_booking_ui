export interface UserDetails {
    name?: string;
    email: string;
}

export interface BookingSummary {
    branchName: string;
    branchAddress: string;
    serviceName: string;
    date: string;
    time: string;
    userDetails: UserDetails;
}
