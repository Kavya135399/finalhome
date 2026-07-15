# HomeSeva — Trusted Home Services, Booked Online

A premium, production-ready home-services booking platform (Urban Company style) where customers can book verified professionals for 20+ home services.

## Tech Stack

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS** — custom design system (blue/white/gray palette, glassmorphism, soft shadows)
- **React Router** — client-side routing with lazy loading & protected routes
- **Framer Motion** — page transitions, scroll reveals, micro-interactions
- **React Hook Form** — form validation
- **Supabase** — authentication (JWT-based email/password, password reset), backend
- **lucide-react** — icons

## Features

### Customer
- Home page with hero search, categories, why-choose, how-it-works, featured pros, testimonials, stats, app download, FAQ, newsletter
- Services listing with category / price / rating filters, sorting, search, pagination (load-more)
- Service details with image, description, features, reviews, rating breakdown, similar services, booking sidebar
- Multi-step booking flow (date & slot → address → coupon → payment) with live summary
- User dashboard: overview stats, bookings (filter/cancel), favorites, saved addresses, notifications, wallet, profile
- Dark mode (persisted), toast notifications, loading skeletons, empty states, responsive mobile-first design

### Professional
- Dashboard: overview, accept/reject job requests, calendar, earnings, reviews, profile

### Admin
- Analytics dashboard: KPIs, revenue chart, top services, recent bookings table, quick-manage tiles

### Auth
- JWT login, register (customer/professional role), forgot password, protected routes

## Pages

| Route | Page |
|-------|------|
| `/` | Home |
| `/services` | Services listing |
| `/services/:slug` | Service details |
| `/book/:slug` | Booking flow |
| `/dashboard` | User dashboard (protected) |
| `/admin` | Admin dashboard (protected) |
| `/pro/dashboard` | Professional dashboard (protected) |
| `/login`, `/register`, `/forgot-password` | Auth |
| `/about`, `/contact` | Info |
| `/privacy`, `/terms` | Legal |
| `*` | 404 |

## Getting Started

```bash
npm install
npm run dev
```

The dev server starts automatically. Open the URL shown in your terminal.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint |

## Project Structure

```
src/
  components/        Reusable UI (Button, Input, Modal, Loader, Badge, Rating, cards)
  layouts/           RootLayout, AuthLayout
  pages/             Route pages (lazy-loaded)
  context/           Theme, Toast, Auth providers
  services/          Supabase client
  types/             TypeScript domain types
  data/              Sample data (services, categories, pros, reviews, bookings)
```

## Design

- **Palette:** Blue `#2563EB` primary, neutral grays, white surfaces
- **Typography:** Sora (display) + Inter (body)
- **Effects:** Glassmorphism, soft shadows, rounded-2xl corners, smooth Framer Motion transitions
- **Responsive:** Mobile-first, breakpoints from `sm` to `xl`

## Notes

- Catalog data (services, categories, professionals, reviews) is realistic sample data.
- Authentication is wired to Supabase (email/password). Create an account from `/register`.
- Payments, invoice download, and image upload are placeholders as noted in the spec.
