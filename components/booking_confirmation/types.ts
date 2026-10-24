export interface UserDetails {
    name?: string;
    email: string;
}

export interface BookingSummary {
    branchName: string;
    branchSuburb: string;
    serviceName: string;
    date: string;
    time: string;
    userDetails: UserDetails;
}
