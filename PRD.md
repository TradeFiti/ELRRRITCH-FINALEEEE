# Eltrich Prime — Product Requirements Document (PRD)

> **Version**: 1.0
> **Date**: March 17, 2026
> **Product**: Eltrich Prime — Private Family Office Investment Platform
> **Platforms**: iOS, Android, Web (responsive)
> **Tech Stack**: Expo 54, React Native 0.81, Convex (real-time backend), Clerk (auth), Uniwind (Tailwind CSS for RN)

---

## 1. Product Overview

Eltrich Prime is a **private family office investment platform** serving qualified investors. It provides a secure, multi-platform experience for investors to manage their portfolios, wallets, and communications — while giving administrators full control over KYC compliance, transaction approvals, product management, and client support.

### 1.1 Brand Identity
- **Positioning**: Luxury private family office
- **Color Palette**: Warm amber/gold (`#d4952a` light, `#e8ad3b` dark) on warm off-white (`#faf8f5`) / deep slate (`#0f1219`)
- **Typography**: Serif headings (luxury feel), sans-serif body
- **Tone**: Professional, exclusive, trustworthy

### 1.2 User Roles

| Role | Description |
|------|-------------|
| **Investor (user)** | Qualified individual who invests, manages wallets, and communicates with the office |
| **Admin** | Staff member who reviews KYC, approves transactions, manages products, and handles support |
| **Super Admin** | Full system access including admin management and system configuration |
| **Public (unauthenticated)** | Can view the landing page and submit consultation requests |

---

## 2. Platform Architecture

### 2.1 Navigation Model

| Platform | Navigation Pattern |
|----------|--------------------|
| **Mobile (iOS/Android)** | Bottom tabs (Home, Invest, Wallet) + Drawer for secondary screens |
| **Web (Desktop)** | Collapsible sidebar with full navigation menu |
| **Web (Mobile)** | Hamburger menu with drawer navigation |

### 2.2 Route Groups

| Group | Purpose | Auth Required |
|-------|---------|---------------|
| `(welcome)` | First-time mobile welcome carousel | No |
| `(auth)` | Sign in / Sign up | No |
| `(onboarding)` | Post-auth onboarding (KYC, bank, verification) | Yes |
| `(app)` | Main authenticated app | Yes |
| `(app)/(admin)` | Admin dashboard & management | Yes + Admin role |

---

## 3. Public Experience (Unauthenticated)

### 3.1 Landing Page (Web Only)

**Purpose**: Marketing page for the Eltrich Prime brand targeting qualified investors.

**Sections**:
- **Navbar** — Logo, navigation links, "Client Portal" CTA, mobile hamburger menu
- **Hero** — Luxury tagline: *"Eltrich Prime. A private family office serving qualified investors..."*, serif typography, CTA buttons (Get Started, Learn More)
- **Philosophy** — Brand values and investment philosophy
- **How We Work** — Step-by-step process overview
- **Investment Approach** — Strategy and methodology explanation
- **Services** — Service offerings breakdown
- **Goals** — Firm objectives and client outcomes
- **Footer** — Links, legal text, branding

### 3.2 Consultation Request Form

**Purpose**: Allow prospective investors to request advisory consultations without signing up.

**Fields**: Name, email, phone, message, preferred contact method
**Flow**: Submit → Admin receives in consultation dashboard → Admin assigns, follows up, adds notes
**Statuses**: `new` → `contacted` → `scheduled` → `completed` / `cancelled`

---

## 4. Authentication

### 4.1 Sign Up

**Screen**: `(auth)/sign-up`

**Flow**:
1. Enter email + password
2. Email verification code sent
3. Enter verification code
4. Account created → Redirect to onboarding

**Validation**: Email format, password strength (Clerk-managed)

### 4.2 Sign In

**Screen**: `(auth)/sign-in`

**Methods**:
- **Email + Password** — Standard credential login
- **Email Code** — Passwordless magic link/code
- **OAuth** — Google, Apple (via `SocialButton` components)

**Two-Factor Authentication (2FA)**:
- TOTP (authenticator app)
- Phone SMS code
- Email code
- Backup codes

**Flow**:
1. Enter credentials / tap OAuth provider
2. If 2FA enabled → Select verification method → Enter code
3. Authenticated → Check onboarding status → Route accordingly

### 4.3 Auth Guards

- **Unauthenticated users** → Redirected to `(auth)/sign-in`
- **Authenticated but not onboarded** → Redirected to `(onboarding)`
- **Non-admin accessing admin routes** → Redirected to `(app)` home

---

## 5. Onboarding Flow

**Screen Group**: `(onboarding)/`
**Layout**: Stack navigation with slide-from-right animation
**Prerequisite**: User must be authenticated

### Step 1: Profile Setup (`(onboarding)/index`)

**Fields**:
- First name (required)
- Last name (required)
- Phone number (required)
- Avatar photo (optional — camera or gallery upload)

**Backend**: Creates/updates user profile in Convex, initializes default wallets (KES + USD)

### Step 2: KYC Submission (`(onboarding)/kyc`)

**Fields**:
- Date of birth
- Nationality
- ID type (National ID, Passport, Driving License)
- ID number
- Residential address (street, city, state/province, country, postal code)
- Investor classification selection
- Regulatory declarations:
  - Politically Exposed Person (PEP) status
  - US Person status
- Terms & conditions acceptance

**Investor Classification** (captured separately):
- Net worth range
- Annual income range
- Investment experience level
- Risk tolerance (conservative / moderate / aggressive)
- Investment objectives
- Source of funds
- Sophisticated investor declaration

**Backend**: Creates versioned KYC submission in `draft` status → user submits for review

### Step 3: Identity Verification (`(onboarding)/verification`)

**Integration**: Smile ID (biometric identity verification)

**Flow**:
1. User initiates liveness check
2. SmileID SDK captures facial biometrics (native) or web capture
3. Job ID recorded in submission
4. Webhook receives verification result:
   - Result code `1020` (exact match) → Auto-approve
   - Other codes → Manual admin review required
5. Confidence score and verification date stored

**Documents Supported**: ID front/back, passport, proof of residence, business documents, selfie

### Step 4: Bank Account Linking (`(onboarding)/bank-account`)

**Fields**:
- Bank name
- Account holder name
- Account number
- Currency (KES or USD)
- Branch code (optional)
- SWIFT/BIC code (optional, for USD)

**Flow**: Submit → Status `pending` → Admin reviews and approves/rejects

**Completion**: After all 4 steps, `onboardingComplete` flag set → full app access granted

---

## 6. Investor Experience (Authenticated)

### 6.1 Home / Dashboard (`(app)/index`)

**Purpose**: Central hub showing portfolio overview, wallet balances, and quick actions.

**Components**:

| Section | Description |
|---------|-------------|
| **Greeting** | Time-of-day greeting with user's name |
| **Wallet Cards** | Swipeable (mobile) / side-by-side (web) cards for KES and USD wallets. Shows balance (with hide/show toggle), return percentage, currency flag |
| **Quick Actions** | Grid of 4 actions: Deposit, Withdraw, Invest, Convert |
| **KYC Alert Banner** | Status indicator — Complete (green), Pending Review (amber), Incomplete (red), Rejected (red with retry) |
| **Pending Actions** | Cards showing items requiring attention (pending KYC, pending transactions, pending investments) |
| **Investment Summary** | Top 2 active investments with product name, invested amount, current value, return % with trend arrow. Empty state with "Start Investing" CTA |
| **Recent Transactions** | Last 3 transactions showing type icon, description, amount, relative time |
| **Featured Products** | Top 2 available investment products with gradient cards, risk badge, minimum investment, unit price |

### 6.2 Investment Hub (`(app)/invest/index`)

**Purpose**: Browse investment products and manage portfolio.

**Tabs**:

#### Products Tab
- **Search bar** — Filter products by name/description
- **Risk filter chips** — All, Low, Medium, High
- **Product cards** displaying:
  - Product name & category
  - Risk level badge (color-coded: green/amber/red)
  - Unit price (with currency)
  - Minimum investment amount
  - Brief description
- **Tap** → Navigate to product detail

#### My Investments Tab
- **Portfolio summary card**:
  - Total current value
  - Total return % (positive green / negative red)
  - Total amount invested
  - Active investments count
  - Pending investments count
- **Investment cards** for each holding:
  - Product name
  - Status badge (active / pending / exited / rejected)
  - Units held
  - Entry price per unit
  - Current value
  - Return percentage with trend indicator
- **Exit button** on active investments → opens Exit Bottom Sheet

### 6.3 Product Detail (`(app)/invest/[productId]`)

**Purpose**: View full product information and invest.

**Sections**:
- Product name, category, status
- Description
- Unit price (current)
- Risk classification & volatility
- Fund details (NAV, inception date)
- Asset breakdown (structured allocation)
- Principal risks
- Minimum investment amount
- **"Invest" CTA button** → opens Invest Bottom Sheet

### 6.4 Invest Bottom Sheet

**Multi-step flow**:
1. **Amount Entry**: Currency selector, amount input, preset quick-select buttons ($100, $500, $1000, $5000), calculated units display
2. **Summary**: Product name, investment amount, estimated units, unit price, currency
3. **Confirmation**: Submit investment request
4. **Success State**: Confirmation message, reference info

**Backend**: Creates investment record with `pending` status → awaits admin approval

### 6.5 Exit Bottom Sheet

**Flow**:
1. **Unit Selection**: Toggle to sell all or enter partial units, real-time estimated exit value calculation
2. **Summary**: Units to sell, estimated proceeds, product info
3. **Confirmation**: Submit exit request
4. **Success State**: Exit request submitted

**Backend**: Creates exit request with `pending_exit` status → awaits admin approval

### 6.6 Wallet (`(app)/wallet/index`)

**Purpose**: Manage multi-currency wallets and linked bank accounts.

**Sections**:

| Section | Description |
|---------|-------------|
| **KES Wallet Card** | Balance (hideable), warm gradient styling, currency flag, active/inactive status |
| **USD Wallet Card** | Balance (hideable), blue gradient styling, currency flag |
| **Quick Actions** | Deposit, Withdraw buttons |
| **Convert Button** | Opens currency conversion sheet |
| **Bank Accounts** | List of linked accounts showing bank name, masked account number (****1234), status badge, primary indicator (star icon) |
| **Add Account** | Button to add new bank account |

### 6.7 Deposit Sheet

**Flow**:
1. **Currency Selection**: KES or USD
2. **Amount Input**: Enter deposit amount
3. **Reference Generation**: System generates unique deposit reference number
4. **Instructions**: Bank transfer instructions with reference
5. **Confirmation**: Deposit request created

**Backend**: Creates transaction with type `deposit`, status `pending` → admin approves when funds received

### 6.8 Withdraw Sheet

**Flow**:
1. **Currency Selection**: KES or USD
2. **Balance Display**: Current available balance
3. **Amount Input**: Enter amount with "MAX" quick-fill button
4. **Bank Account Selection**: Choose from approved linked accounts (masked numbers)
5. **Summary**: Amount, destination account, estimated timeline
6. **Confirmation**: Submit withdrawal request

**Backend**: Creates transaction with type `withdrawal`, status `pending` → admin verifies and approves → balance debited

### 6.9 Convert Sheet

**Flow**:
1. **From/To Display**: Visual currency indicators with swap button
2. **Amount Input**: Enter amount to convert
3. **Rate Display**: Admin-set exchange rate shown
4. **Estimated Output**: Calculated conversion result
5. **Confirmation**: Submit conversion request

**Backend**: Creates `currencyConversionRequest` with `pending` status → admin approves with rate → balances adjusted

### 6.10 Bank Account Management (`(app)/wallet/bank-accounts`)

**Purpose**: Add, edit, and manage linked bank accounts.

**Features**:
- **List View**: All linked accounts with status badges (approved, pending, rejected)
- **Primary Account**: Star indicator, one primary per currency
- **Add Account**: Form with bank name, holder name, account number, currency, branch/SWIFT codes
- **Edit Account**: Modify details (resets status to `pending` for re-approval)
- **Remove Account**: Soft-delete with confirmation

### 6.11 Chat / Support (`(app)/chat`)

**Purpose**: Direct messaging with Eltrich Prime support team.

**Layout**:
- **Web**: Split-pane — conversation list (left) + message thread (right)
- **Mobile**: Full-screen conversation list → push to message thread

**Conversation List**:
- Search bar for filtering threads
- Thread cards showing: avatar, subject, last message preview, category label, relative time, unread count badge (capped at 99+)
- Sorted by most recent activity

**Message Thread**:
- Chat bubbles with distinct styling (user = right/primary, support = left/muted)
- Sender name and avatar
- Timestamp per message
- File/image attachment previews inline
- Auto-scroll to latest message
- Typing indicator (animated three dots)

**New Thread Sheet**:
- Subject line
- Category picker: General, Investment, Transaction, KYC, Technical, Account, Other
- Initial message body
- Submit → Thread created, appears in list

**Attachments**: Images and files supported via picker (camera, gallery, file browser)

### 6.12 File Management (`(app)/files`)

**Purpose**: Upload, organize, and manage documents.

**Features**:
- **File List**: Categorized display (image, video, audio, document, archive, code, other)
- **Upload Sources**: Browse files (all types), photo library, take photo (camera)
- **Upload Progress**: Per-file progress bar, status indicators (uploading, done, error), clear completed
- **Storage Bar**: Segmented visualization showing usage by category, percentage used, file count, 1GB default quota
- **File Preview Modal**: Full-screen viewer for images (contained), metadata display for other types
- **File Actions**: Download, share, delete, toggle favorite
- **File Type Icons**: Visual category indicators with distinct colors

### 6.13 Notifications (`(app)/notifications`)

**Purpose**: View in-app notification feed.

**Features**:
- Notification list (50 most recent)
- Unread count badge (in tab/sidebar)
- Mark individual as read (tap)
- Mark all as read (bulk action)
- Delete individual / clear all
- Notification types: KYC updates, transaction status, investment status, system announcements, chat messages
- Action routes: Tap notification → navigate to relevant screen
- Auto-expiry support

**Push Notifications**:
- iOS: APNs via Expo Push API
- Android: FCM via Expo Push API
- Web: Web Push API (VAPID)
- Automatic token cleanup on device unregistration

### 6.14 Profile (`(app)/profile`)

**Sections**:
- **Avatar**: Photo or initials fallback
- **Identity**: Full name, email, phone number
- **KYC Status Badge**: Verified (green), Under Review (amber), Incomplete (gray), Rejected (red)
- **Edit Profile**: Opens edit form (mobile) or Clerk modal (web)
- **Contact Info**: Email, phone, member since date
- **Bank Accounts**: Approved accounts list with "Manage" link
- **Quick Settings**: Security (Clerk), dark mode toggle, app version

### 6.15 Profile Edit (`(app)/profile-edit`)

**Fields**: First name, last name, phone number, avatar photo
**Web**: Delegates to Clerk's built-in profile editor
**Mobile**: Native form with photo picker

### 6.16 Settings (`(app)/settings`)

**Sections**:

| Section | Items |
|---------|-------|
| **Account** | Profile, Security (Clerk), Bank Accounts |
| **Preferences** | Dark Mode toggle, Notifications (coming soon) |
| **About** | Privacy Policy, Terms of Service, App Version |
| **Actions** | Sign Out (mobile only — web uses Clerk component) |

### 6.17 Transaction History (`(app)/transactions`)

**Purpose**: Complete record of all financial activity.

**Transaction Types**:
- Deposit
- Withdrawal
- Investment Purchase
- Investment Sale
- Transfer
- Fee
- Refund
- Currency Conversion

**Display**: Type icon, description, amount (with hide/show toggle), relative time, status badge
**Filters**: By type, by status (optional)

---

## 7. Admin Experience

**Access**: Protected by `useAdminGuard()` hook — checks `profile.role` is `admin` or `superadmin`
**Navigation**: Stack layout within `(app)/(admin)/` route group with back navigation
**Visibility**: Admin nav items appear conditionally in sidebar/drawer

### 7.1 Admin Dashboard (`(admin)/index`)

**Purpose**: Overview of platform activity and pending items requiring attention.

**Stats Cards**:
| Metric | Description |
|--------|-------------|
| Total Users | All registered users |
| Pending KYC | Submissions awaiting review |
| Pending Transactions | Deposits/withdrawals awaiting approval |
| Pending Investments | Investment requests awaiting approval |
| Active Users | Users with active status |
| Pending Bank Accounts | Account linkages awaiting verification |

**Quick Action Grid**: Navigate to Users, KYC Review, Transactions, Investments, Products, Bank Accounts, Support, Notifications

### 7.2 User Management (`(admin)/users`)

**Purpose**: Search, filter, and manage all platform users.

**Features**:
- **Search**: By name or email (real-time)
- **Status Filters**: All, Active, Suspended, Pending
- **Role Filters**: All, Admin, User
- **User Cards**: Avatar, full name, email, role badge, status badge, join date
- **Tap → User Detail** page

### 7.3 User Detail (`(admin)/user-detail`)

**Purpose**: Complete view of a single user's profile and activity.

**Sections**:
- Full profile information (name, email, phone, role, status)
- KYC submission status and details
- Transaction history for this user
- Investment holdings
- Linked bank accounts
- Activity timeline

### 7.4 KYC Review (`(admin)/kyc-review`)

**Purpose**: Review and approve/reject KYC submissions.

**Filter Tabs**: Submitted, In Review, Approved, Rejected

**Submission Card**:
- User avatar, name, email
- Status badge
- Submission date
- Quick info: ID type, nationality, SmileID verification status

**Detail Sheet** (tap to expand):
- Full KYC data: DOB, nationality, address, ID type & number
- Investor type (individual/company/trust)
- Regulatory declarations (PEP, US Person)
- **SmileID Section**: Job ID, verification result code, confidence score, verification date
- Uploaded documents (ID front/back, passport, proof of residence, selfie)

**Actions**:
- **Approve**: Single-click approval (sets status to `approved`, updates profile KYC status)
- **Reject**: Opens reason input → rejection with explanation stored

### 7.5 Transaction Management (`(admin)/transactions`)

**Purpose**: Review and approve/reject pending financial transactions.

**Filter Tabs**: Pending, All

**Transaction Card**: Type icon, user name, amount, currency, status badge, relative time

**Detail Sheet**:
- Transaction type & status
- Amount & currency
- Date/time
- Reference number
- Source/destination details
- Notes/metadata

**Actions** (pending only):
- **Approve**: Approves transaction → balance credited (deposits) or debited (withdrawals)
- **Reject**: Opens reason input → transaction rejected with explanation

### 7.6 Investment Management (`(admin)/investments`)

**Purpose**: Review and approve/reject investment requests and exits.

**Filter Tabs**: Pending, All

**Investment Card**: User name, product name, units, entry price, current value, status badge

**Detail Sheet**:
- Full investment details (product, units, pricing, dates)
- Investor profile summary
- Investment history

**Actions** (pending only):
- **Approve**: Activates investment, allocates units
- **Reject**: Opens reason input → investment request rejected

### 7.7 Bank Account Review (`(admin)/bank-accounts`)

**Purpose**: Verify and approve user-linked bank accounts.

**Features**:
- List of pending bank account submissions
- Account details: bank name, holder name, account number, currency, branch/SWIFT
- Profile enrichment (shows user info alongside account)

**Actions**:
- **Approve**: Marks account as verified and approved
- **Reject**: Opens reason input → account rejected

### 7.8 Currency Conversion Review (`(admin)/conversions`)

**Purpose**: Review and process KES ↔ USD conversion requests.

**Features**:
- Pending conversion requests list
- From/to currencies and amounts
- Admin-set exchange rate application
- Approve with rate → balances adjusted in both wallets
- Reject with reason

### 7.9 Product Management (`(admin)/products`)

**Purpose**: Create, edit, and manage investment products.

**Product Form Fields**:
- Product name & description
- Category
- Risk classification (Low / Medium / High)
- Unit price
- Minimum investment amount
- Currency (KES / USD)
- Fund details (NAV, inception date, volatility)
- Asset breakdown (structured allocation percentages)
- Principal risks description
- Status (active / paused / archived)

**Actions**:
- **Create**: New product with all fields
- **Edit**: Update any product fields
- **Pause**: Stop accepting new investments (existing holdings unaffected)
- **Resume**: Re-enable paused product
- **Archive**: Remove from active listings (soft-delete)

### 7.10 Consultation Management (`(admin)/consultations`)

**Purpose**: Manage consultation requests from the public landing page.

**Features**:
- All requests with status filters (new, contacted, scheduled, completed, cancelled)
- Request details: name, email, phone, message, preferred contact method
- Assignment to admin team member
- Notes system (append-only history)
- Status transitions with timestamp tracking

### 7.11 Notification Management (`(admin)/notifications`)

**Purpose**: Send targeted or bulk notifications to users.

**Features**:
- **Broadcast**: Send notification to all active users
- **Targeted**: Send to specific user(s)
- Notification composition: title, body, category, priority, action route
- Delivery: In-app + push (iOS, Android, Web)

### 7.12 Support Dashboard (`(admin)/support`)

**Purpose**: Overview of support tickets and pending items.

**Features**:
- Pending ticket count
- Open/assigned/resolved ticket lists
- Quick navigation to chat management

### 7.13 Admin Chat Console (via `(app)/chat` with admin role)

**Purpose**: Respond to investor support threads.

**Admin-specific features**:
- View all threads (not just own)
- Assign threads to specific admin
- Change thread status (open → assigned → pending → resolved → closed)
- Set thread priority (low / normal / high / urgent)
- Add internal notes (visible only to admins)
- Use quick-reply templates
- Create/edit response templates

---

## 8. Data Model Summary (18 Tables)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User identity & settings | clerkId, role, onboardingComplete, invitedBy |
| `kycSubmissions` | KYC form data | profileId, status, version, smileIdJobId |
| `kycDocuments` | Identity document files | submissionId, type, storageId |
| `investorClassifications` | Financial suitability | netWorth, income, riskTolerance, experience |
| `wallets` | Multi-currency balances | profileId, currency, balance (string) |
| `bankAccounts` | Linked bank accounts | profileId, bankName, accountNumber, status |
| `products` | Investment product catalog | name, unitPrice, riskClassification, status |
| `investments` | User investment holdings | profileId, productId, units, status |
| `transactions` | Financial movements | profileId, type (8 types), amount, status |
| `currencyConversionRequests` | FX conversion tracking | profileId, fromCurrency, toCurrency, status |
| `chatThreads` | Support conversations | profileId, status, priority, unreadCount |
| `chatMessages` | Thread messages | threadId, senderId, body, attachments |
| `chatInternalNotes` | Admin-only thread notes | threadId, adminId, body |
| `chatTemplates` | Admin quick replies | title, body, category, status |
| `consultationRequests` | Landing page submissions | name, email, status, assignedTo |
| `notifications` | In-app notifications | profileId, type, priority, actionRoute |
| `notificationPreferences` | Per-user notification settings | profileId, preferences object |
| `pushTokens` | Device push tokens | profileId, token, platform |
| `files` | User file storage | profileId, name, category, isFavorite |

**Key Design Patterns**:
- Financial values stored as **strings** for precision (no floating-point errors)
- **Soft-delete** via `deletedAt` timestamps (no hard deletions)
- **Versioned** KYC submissions (increment on resubmission)
- **Approval workflows** on: KYC, bank accounts, transactions, investments, conversions
- **Ownership checks** on all user queries (admins bypass)
- **Composite indexes** for efficient multi-field queries

---

## 9. Cross-Cutting Concerns

### 9.1 Authentication & Authorization

| Layer | Implementation |
|-------|---------------|
| Auth Provider | Clerk (JWT-based) |
| Token Verification | Server-side via Convex auth middleware |
| Role Check | `requireAuth()`, `requireAdmin()`, `requireSuperAdmin()` |
| Ownership | `requireOwnership()` — admins bypass |
| Route Guards | `useAdminGuard()` hook on admin route group |

### 9.2 Real-Time Data

All data flows through **Convex**, providing:
- Real-time subscriptions (balance updates, chat messages, notifications)
- Optimistic updates on mutations
- Automatic reconnection

### 9.3 Deep Linking

- **Custom Scheme**: `eltrich-prime://`
- **Universal Links**: Web URL → app routing
- **Use Cases**: OAuth callbacks, notification taps, email links, marketing
- **Handler**: `useDeepLink()` hook with `parseDeepLink()` utility

### 9.4 Push Notifications

| Platform | Delivery |
|----------|----------|
| iOS | APNs via Expo Push API |
| Android | FCM via Expo Push API |
| Web | Web Push API (VAPID keys) |

- Multi-device support (multiple tokens per user)
- Automatic token cleanup on device unregistration (410/404 responses)
- Foreground + background + cold-start handling

### 9.5 Theme System

- **Light/Dark mode** toggle (persisted to AsyncStorage)
- Semantic color tokens in `global.css` (bg-background, text-foreground, text-primary, etc.)
- Automatic dark mode — no `dark:` prefix needed
- `useThemeColor()` for programmatic access to CSS variables

### 9.6 File Upload

- **Storage**: Convex file storage
- **Flow**: Generate upload URL → upload file → save metadata
- **Sources**: File browser, photo library, camera
- **Categories**: image, video, audio, document, archive, code, other
- **Quota**: 1GB default per user

### 9.7 Webhooks

- **Smile ID** (`/webhooks/smile-id`): Receives KYC verification results, validates signature, auto-approves on exact match (code 1020)

---

## 10. Complete User Flow Diagrams

### 10.1 New Investor Journey

```
Landing Page (web)
    ↓ "Get Started"
Sign Up (email + password)
    ↓ Email verification
Onboarding Step 1: Profile (name, phone, avatar)
    ↓
Onboarding Step 2: KYC (DOB, nationality, ID, address, investor classification)
    ↓
Onboarding Step 3: Verification (SmileID liveness + biometric)
    ↓
Onboarding Step 4: Bank Account (link primary account)
    ↓
→ Home Dashboard (full app access)
```

### 10.2 Investment Flow

```
Home Dashboard
    ↓ "Invest" quick action or Invest tab
Investment Hub → Products Tab
    ↓ Browse / Search / Filter by risk
Product Detail Page
    ↓ "Invest" button
Invest Bottom Sheet:
    Step 1: Enter amount → see calculated units
    Step 2: Review summary
    Step 3: Confirm
    Step 4: Success → Investment status: PENDING
        ↓
    [Admin reviews in Investment Management]
        ↓ Approve
    Investment status: ACTIVE
        ↓
    [Investor can track in My Investments tab]
        ↓ "Exit" button
    Exit Bottom Sheet: Select units → Confirm
        ↓
    Exit status: PENDING_EXIT
        ↓
    [Admin approves exit]
        ↓
    Investment status: EXITED → proceeds credited to wallet
```

### 10.3 Deposit Flow

```
Home Dashboard → "Deposit" quick action
    OR Wallet → "Deposit" button
        ↓
Deposit Sheet:
    Step 1: Select currency (KES/USD)
    Step 2: Enter amount
    Step 3: Receive reference number + bank instructions
    Step 4: Confirmation → Transaction status: PENDING
        ↓
    [User transfers funds to Eltrich bank account with reference]
        ↓
    [Admin verifies receipt in Transaction Management]
        ↓ Approve
    Wallet balance credited → Transaction status: COMPLETED
```

### 10.4 Withdrawal Flow

```
Wallet → "Withdraw" button
    ↓
Withdraw Sheet:
    Step 1: Select currency
    Step 2: See available balance
    Step 3: Enter amount (or tap MAX)
    Step 4: Select destination bank account (from approved accounts)
    Step 5: Review summary
    Step 6: Confirm → Transaction status: PENDING
        ↓
    [Admin reviews in Transaction Management]
        ↓ Approve
    Wallet balance debited → Funds sent → Transaction status: COMPLETED
```

### 10.5 Currency Conversion Flow

```
Wallet → "Convert" button
    ↓
Convert Sheet:
    Step 1: See from/to currencies (with swap toggle)
    Step 2: Enter amount
    Step 3: See admin-set rate + estimated output
    Step 4: Confirm → Conversion status: PENDING
        ↓
    [Admin reviews in Conversion Management]
        ↓ Approve with rate
    From-wallet debited, to-wallet credited → Status: COMPLETED
```

### 10.6 Support Chat Flow

```
Chat screen (sidebar/tab)
    ↓ "New Conversation" button
New Thread Sheet:
    Enter subject, select category, write message
    → Thread created
        ↓
    [Admin sees in chat console]
    [Admin assigns to self, changes priority]
    [Admin replies (or uses quick template)]
        ↓
    [Investor receives push notification]
    [Investor sees unread badge]
    [Investor replies with optional attachments]
        ↓
    [Thread continues until resolved]
    [Admin marks as resolved/closed]
    [User can provide feedback/rating]
```

### 10.7 Admin KYC Review Flow

```
Admin Dashboard → "KYC Review" or pending count
    ↓
KYC Review screen → "Submitted" tab
    ↓ Tap submission
Detail Sheet:
    Review: DOB, nationality, ID, address
    Review: Investor classification
    Review: SmileID results (confidence score, match result)
    Review: Uploaded documents
        ↓
    [Approve] → KYC status: APPROVED → user profile updated
    [Reject] → Enter reason → KYC status: REJECTED → user notified
```

---

## 11. Non-Functional Requirements

### 11.1 Security
- All API calls authenticated via Clerk JWTs verified server-side
- Ownership checks on all user data queries
- Role-based access control (user / admin / superadmin)
- Webhook signature verification (SmileID)
- Sensitive data masking (bank account numbers shown as ****1234)
- Soft-delete pattern (audit trail preserved)

### 11.2 Performance
- Convex real-time subscriptions (no polling)
- Optimistic UI updates
- Lazy loading of routes (Expo Router)
- Image optimization and contained rendering

### 11.3 Accessibility
- Semantic color tokens (not hardcoded colors)
- Platform-adaptive navigation (respects OS conventions)
- Keyboard-aware layouts for forms

### 11.4 Compliance
- KYC/AML verification via SmileID
- PEP and US Person declarations
- Investor suitability classification
- Document retention (soft-delete, no hard delete)
- Audit trail on all approval workflows

---

## 12. Future Considerations (Not Yet Implemented)

Based on UI indicators and "coming soon" labels in the codebase:

- **Notification Preferences**: Per-category notification settings (UI exists, backend schema ready)
- **Investment Analytics**: Portfolio performance charts and breakdowns
- **Recurring Investments**: Automated periodic investment plans
- **Multi-language Support**: Internationalization
- **Advanced Admin Analytics**: Charts, export, reporting
- **Two-way File Sharing**: Admin sharing documents with investors
- **Video/Audio Support**: Rich media in chat
