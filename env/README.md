# Environment Variables Guide

This directory holds the template configuration files for **Dominion International School Management System**.

## Setup Quickstart

To run the application locally with full services enabled:

1. Copy either `.env.example` or `env/.env.development.example` to `.env.local` in the project root:
   ```bash
   cp .env.example .env.local
   ```
2. Populate the required keys for each service:

---

### 1. Clerk (Authentication & User Management)
- Sign up or log into [Clerk Dashboard](https://dashboard.clerk.com).
- Create a new application named **"Dominion International School"**.
- Under **API Keys**, copy:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_...` or `pk_live_...`)
  - `CLERK_SECRET_KEY` (starts with `sk_test_...` or `sk_live_...`)
- Under **User & Authentication > Roles & Permissions**, define roles:
  - `admin` (Principal / Bursar / Registrar)
  - `teacher` (Subject Teacher / Form Tutor)
  - `student`
  - `parent`

---

### 2. Supabase (Database & Storage)
- Create a project on [Supabase](https://supabase.com).
- Under **Project Settings > API**:
  - `NEXT_PUBLIC_SUPABASE_URL`: Your Project URL (`https://<project-ref>.supabase.co`)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The `anon` public key
  - `SUPABASE_SERVICE_ROLE_KEY`: The `service_role` secret key (for server-side actions)
- In the **SQL Editor**, run the database schema located at [`supabase/schema.sql`](../supabase/schema.sql).
- Under **Storage > Buckets**, ensure these 3 buckets exist:
  1. `student-avatars` (Public bucket for passport photos)
  2. `report-cards` (Private bucket for termly PDF dossiers)
  3. `bursary-receipts` (Private bucket for verified payment receipts)

---

### 3. Resend (Email Notification Dispatcher)
- Sign up at [Resend](https://resend.com).
- Under **API Keys**, click **Create API Key** and copy:
  - `RESEND_API_KEY` (starts with `re_...`)
- In development, use `onboarding@resend.dev` as the `RESEND_FROM_EMAIL`.
- In production, add and verify your school domain `dominioninternational.sch.ng` under **Domains**.

