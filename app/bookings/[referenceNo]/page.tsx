import {Suspense} from "react";
import type {Metadata} from "next";
import BookingDetails, {BookingLoading} from "@/components/booking_lookup/BookingDetails";

// The booking reference is part of this URL, so keep it out of search indexes and Referer headers.
export const metadata: Metadata = {
    title: "Your booking",
    robots: {index: false, follow: false},
    referrer: "no-referrer",
};

// With Cache Components, route params are runtime data and must be read inside <Suspense>.
export default function BookingPage({params}: PageProps<"/bookings/[referenceNo]">) {
    return (
        <Suspense fallback={<BookingLoading/>}>
            {params.then(({referenceNo}) => (
                <BookingDetails referenceNo={referenceNo}/>
            ))}
        </Suspense>
    );
}
