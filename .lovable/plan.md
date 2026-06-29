## Neptune Bank — Port from Spring Boot to Lovable Cloud

The GitHub repo is a microservice banking system (auth, user, account, transaction, otp). I'll consolidate the 5 services into a single Lovable Cloud backend (Postgres + RLS + server functions) and build a React frontend.

### What changes vs. the original

- 5 microservices + RabbitMQ + Eureka → one Lovable Cloud project. RabbitMQ event flows become direct DB writes inside server functions (transactional).
- Custom JWT auth → Lovable Cloud auth (email/password). Roles (`ADMIN`, `EMPLOYEE`, `USER`) move into a separate `user_roles` table with a `has_role()` security-definer function.
- Spring `@RestController` endpoints → TanStack `createServerFn` (app calls) and `/api/public/*` server routes only where external callers need raw HTTP.
- Multi-channel OTP (SMS/email) → email OTP via Lovable AI/Resend, stored & verified in a server function. SMS deferred (no Twilio in scope).

### Data model (Postgres tables)

Auth & roles
- `profiles` — id (FK auth.users), username, full_name, created_at
- `app_role` enum: `admin`, `employee`, `user`
- `user_roles` (user_id, role) + `has_role()` SECURITY DEFINER fn

Customer
- `customers` — first/middle/last name, dob, gender, father/mother/spouse name, marital_status, occupation, salary, citizen, category, religion, account_interest_rate, is_active, is_blocked, is_deleted, profile_id FK
- `contact_details` — customer_id, mobile, email, communication_address, permanent_address, city, state, zip, landmark, country, alt mobile/email
- `kyc` — customer_id, aadhaar, pan, document_urls, verified, verified_by, verified_at
- `nominees` — customer_id, name, relationship, dob, contact

Banking
- `branches` — name, ifsc (unique), address, city, state, manager
- `accounts` — customer_id, branch_id, account_number (unique), account_type (SAVINGS/CURRENT/…), mode_of_operation, balance numeric(18,2), opened_at, is_active
- `transactions` — account_id, type (DEPOSIT/WITHDRAW/TRANSFER), medium, mode, amount, status, reference, counterparty_account, description, created_at
- `transfers` — source_txn_id, dest_txn_id (for fund transfers spanning 2 transaction rows)

OTP
- `otps` — identifier (email), channel, code_hash, purpose, expires_at, consumed_at, attempts

Enums mirror the Java ones (AccountType, ModeOfOperation, TransactionType, TransactionMedium, TransactionStatus, Gender, MaritalStatus, Occupation, Category, Religion, Relationship).

RLS
- Customers/contact/kyc/nominees/accounts/transactions: owner reads own rows (`profile_id = auth.uid()`); `employee`/`admin` read all; only `admin`/`employee` write KYC verification status and create branches.
- Transactions: insert only via server function (validates balance, atomically updates both accounts on transfer).
- Public anon: no access.

### Server functions (replace controllers)

- `auth.functions.ts` — register (creates auth user + profile + default `user` role), assignRole (admin)
- `users.functions.ts` — createCustomer, updateCustomer, getMyProfile, listCustomers (employee+), softDelete
- `kyc.functions.ts` — submitKyc, verifyKyc (employee+)
- `branches.functions.ts` — CRUD (admin)
- `accounts.functions.ts` — openAccount (assigns account_number, links branch), getMyAccounts, listAccounts (employee+), closeAccount
- `transactions.functions.ts` — deposit, withdraw, transfer (single DB transaction, balance check, status), listTransactions (filtered by ownership)
- `otp.functions.ts` — requestOtp (generates 6-digit, stores hash, emails via Lovable AI/Resend), verifyOtp

All write operations use the bearer-attached client; balance-mutating ops use `supabaseAdmin` inside the handler after `requireSupabaseAuth` + role check, wrapped in an RPC for atomicity.

### Frontend (TanStack Start + shadcn)

Public
- `/` — landing (Neptune Bank hero, features)
- `/auth` — login + register tabs

Authenticated (`_authenticated/`)
- `/dashboard` — accounts summary, balance cards, recent transactions
- `/accounts` — list of my accounts, open-account dialog
- `/accounts/$id` — account details + transaction history
- `/transfer` — fund transfer form (source account, destination account #, amount, mode, OTP confirm)
- `/deposit` & `/withdraw` — quick forms
- `/profile` — customer details, contact, nominee, KYC status + submit
- `/kyc` — KYC document upload

Employee/Admin (`_authenticated/_staff/`)
- `/staff/customers` — search, view, block/unblock
- `/staff/kyc` — pending KYC queue, verify/reject
- `/staff/branches` — CRUD
- `/staff/transactions` — global ledger with filters

Design: clean fintech look (deep navy + teal accent, Inter font, card-based dashboards, monospaced account numbers).

### Out of scope (call out explicitly)

- RabbitMQ, Eureka, gateway, Feign clients — replaced by direct in-process calls.
- SMS OTP via Twilio — only email OTP implemented.
- The custom JWT issuance endpoint `/auth/validate` — Supabase session validation replaces it.

### Build order

1. Enable Lovable Cloud.
2. Migration: enums, all tables, GRANTs, `has_role`, RLS policies, atomic transfer RPC.
3. Auth pages (email/password) + profile auto-create trigger + default role.
4. Customer onboarding flow (customer + contact + nominee).
5. Branches + Accounts.
6. Transactions (deposit/withdraw/transfer with OTP).
7. KYC submission + staff verification.
8. Staff dashboards.
9. Polish: landing page, navigation, role-gated layouts.

This is a large build — I'll implement it in the order above so each step is usable on its own.
