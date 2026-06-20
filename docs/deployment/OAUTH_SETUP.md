# OAuth Provider Setup

Configure authentication providers so users can sign in with Google and Microsoft.

---

## Google OAuth

### Step 1: Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Navigate to **APIs & Services → OAuth consent screen**
4. Select **External** (or Internal if corporate G Suite)
5. Fill in:
   - **App name:** Work Expense Reimbursement
   - **User support email:** your email
   - **Authorized domains:** `supabase.co` (required), your Vercel domain
6. Save and continue through the wizard

### Step 2: Create OAuth Credentials

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth 2.0 Client IDs**
3. Application type: **Web application**
4. Name: `Work Expense Reimbursement`
5. Authorized redirect URIs — add ALL of these:
   - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
   - `https://your-vercel-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 3: Configure in Supabase

1. Go to **Supabase → Auth → Providers → Google**
2. Toggle **Enable Google**
3. Paste your **Client ID** and **Client Secret**
4. Save

---

## Microsoft (Azure) OAuth

### Step 1: Register Azure App

1. Go to [portal.azure.com](https://portal.azure.com)
2. Navigate to **Azure Active Directory → App registrations → New registration**
3. Fill in:
   - **Name:** Work Expense Reimbursement
   - **Supported account types:** Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI:** `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
4. Click **Register**

### Step 2: Get Credentials

1. After registration, copy the **Application (client) ID** — this is your Client ID
2. Go to **Certificates & secrets → New client secret**
3. Add description, choose expiry (24 months recommended)
4. Copy the **Value** immediately (shown only once) — this is your Client Secret

### Step 3: Add Additional Redirect URIs

1. Go to **Authentication → Add a platform → Web**
2. Add:
   - `https://your-vercel-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`

### Step 4: Configure in Supabase

1. Go to **Supabase → Auth → Providers → Azure**
2. Toggle **Enable Azure**
3. Paste your **Client ID** and **Client Secret**
4. **Azure Tenant:** leave blank for multi-tenant (accepts any Microsoft account), or set your tenant ID for company-only access
5. Save

---

## Magic Link (Email)

Magic Link works out of the box — no configuration required. Supabase handles the email sending via its default SMTP.

For production, set up a custom SMTP server for better deliverability:
- **Supabase → Project Settings → Auth → SMTP Settings**
- Use any SMTP provider (Resend, SendGrid, Postmark, etc.)
- Recommended: [Resend](https://resend.com) — free tier, great deliverability

---

## Verify Auth Works

1. Go to your deployed app → Login page
2. Try each sign-in method:
   - Google: should open Google consent screen
   - Microsoft: should open Microsoft login
   - Magic Link: should send email and show "Check your email"
3. After sign-in, should redirect to `/dashboard`
4. Check **Supabase → Auth → Users** — your user should appear
