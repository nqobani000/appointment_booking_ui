This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Backend integration

- Configure `NEXT_PUBLIC_API_BASE_URL` (see `.env.example`; defaults to `http://localhost:8080` for local development).
- `api/` holds the fetch client, error model, endpoint functions and types. `hooks/` holds TanStack Query hooks and mutations.
- Scripts: `npm test`, `npm run typecheck`, `npm run lint`.

### Credentials
- The session (including the JWT) and the active reservation (including its token) are stored in `sessionStorage` (`lib/sessionStore.ts`, keys `booking.session` and `booking.reservation`). They survive a reload in the same tab and are discarded when the tab closes. Both are ignored once expired.
- They are never put in `localStorage`, URLs, query keys or the TanStack Query cache; the reservation token is only sent as `X-Reservation-Token`.
- After a reload with a held reservation, the flow resumes at the review step.
- The reservation is cleared on release, expiry (`410`), confirmation, a `409` on confirm, start-over and sign-out.
- **Trade-off:** `sessionStorage` is readable by any script on the page (e.g. via XSS). A server-managed HttpOnly session is the safer long-term option.

### Service selection
- "What can we help you with?" defaults to **Available to me**: services the signed-in customer type (`CLIENT` or `GUEST`) may book. The pill at the right of the title switches to **All services**.
- The backend only filters services by search text, so the available view requests the whole catalogue in one call (`size=100`, the backend's maximum page size), filters by `availableTo` in the browser and shows no pager. A branch with more than 100 services would be truncated in that view. The All services view uses the normal server pagination (20 per page).
- In the All services view, choosing a service the customer cannot book shows an inline message instead of selecting it.

### Index screen and booking lookup
- Unauthenticated users land on `components/auth/screens/IndexScreen.tsx` (rendered by `AuthGate`): look up a booking by reference, or start the Client or Guest flow.
- A lookup needs no sign-in. It validates the reference (`lib/bookingReference.ts`), calls `api/appointments.ts` and navigates to the public route `/bookings/[referenceNo]` (`components/booking_lookup/`), which sits outside `AuthGate`. That route is `noindex` and sends no referrer because the reference acts as the credential.
- **Backend contract:** `GET /api/appointments/{referenceNo}` is public (no `Authorization`), matches the reference case-insensitively, and returns the same `Appointment` shape as the confirm call, or `404` when unknown. Because the reference is the only credential, the backend should rate-limit it.
- Real references include an offset after the date (e.g. `APT-20261028Z-741F5018F7`) because the backend formats the date with `BASIC_ISO_DATE` on an offset timestamp. The frontend accepts `Z`, `+HHmm` and `-HHmm` suffixes as well as the documented plain form.

### Known gaps
- There is no "save to calendar" functionality yet.
- The backend has no availability endpoint, so time slots are still generated from the mock operating hours in `components/date_and_time_selection/mockOperatingHours.ts`. A `409` on reservation creation asks the user to pick another time.
