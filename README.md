# CODE MEETS AI — Entry Pass System

A mobile-first digital entry pass and gate verification system for the **CODE MEETS AI** event.

---

## Event Details

* **Event**: CODE MEETS AI — A LITTLE BIT OF CHAOS 💀
* **Date**: 17 September 2026
* **Time**: 09:00 AM IST
* **Venue**: GLOBAL INSTITUTE OF ENGINEERING AND TECHNOLOGY

---

## Features

* **Digital Entry Pass**: Instant digital pass generation upon registration.
* **QR-Based Gate Verification**: Secure gate check-in via unique QR code scanning.
* **5-Digit Backup Verification Code**: Fallback gate check-in code for participants with camera/screen issues.
* **Participant Details & Masked Phone Display**: Privacy-focused pass displaying masked contact numbers.
* **Admin / Gate Scanner**: Real-time scanner interface for gate volunteers to validate entries and log check-ins.
* **Real-Time Check-In Validation**: Prevents duplicate entry attempts with instant visual feedback.
* **“I'M ATTENDING” Social Card**: Custom visual card generator for social media sharing.
* **LinkedIn Caption Preparation**: One-click caption generator and direct posting helper.
* **Mobile-First Experience**: Optimized interface for quick access on mobile browsers.

---

## Tech Stack

* **Framework**: Next.js (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
* **QR Tech**: `qrcode.react` & `html5-qrcode`

---

## Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd code-meets-ai_registration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` from `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. Add required environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ADMIN_SECURITY_KEY=your_admin_security_passphrase
   ```

5. Configure Supabase database by applying SQL migrations from `database/0001_init.sql` and `schema/migrations/`.

6. Run local development server:
   ```bash
   npm run dev
   ```

7. Build for production:
   ```bash
   npm run build
   ```

8. Start production server:
   ```bash
   npm start
   ```

---

## Application Routes

### Participant-Facing Routes
* `/` — Landing page with event details, countdown, and pass access options.
* `/register` — Participant registration flow.
* `/ticket/[token]` — Dynamic digital entry pass page with QR code, backup verification code, and social card generator.

### Admin / Gate Staff Route
* `/admin` — Protected gate check-in scanner and participant roster management interface.
  *(Note: Admin access is protected server-side via passphrase verification).*

---

## Security

* **Secret Protection**: All sensitive keys remain strictly in server-side environment variables (`.env.local`). `.env` files are excluded from Git.
* **Server-Side Admin Verification**: Admin security key validation is performed entirely server-side using cryptographic hashing.
* **Opaque Tokens**: QR codes encode opaque UUID tokens rather than participant PII.
* **Privacy Controls**: Phone numbers are masked on public digital passes (`8019******`).
* **Server-Verified Backup Codes**: 5-digit emergency backup codes are verified against the database via server API endpoints.

---

## Database Management & Pre-Event Reset

* Database schema and migrations are located under `database/` and `schema/`.
* A one-time manual pre-event reset script is available at `scripts/clear-test-participants.sql`.

---

## License

Private & Confidential — Created for **CODE MEETS AI** event.
