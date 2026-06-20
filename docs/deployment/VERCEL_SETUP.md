# Vercel Deployment Setup

Complete these steps after Supabase is configured.

---

## 1. Push Code to GitHub

The repository must be on GitHub before connecting to Vercel.

```bash
git remote -v                    # confirm remote is set
git push origin main             # push latest code
```

---

## 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import your GitHub repository: `noris-medical-licenses-hq/WORK-EXPENSE-REIMBURSEMENT-PLATFORM`
4. Vercel auto-detects Next.js — keep all defaults
5. Do NOT deploy yet — configure env vars first (next step)

---

## 3. Configure Environment Variables

In the Vercel project settings (**Settings → Environment Variables**), add:

| Variable | Value | Environments |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key | Production, Preview, Development |

**Important:** Never add `service_role` key here.

---

## 4. Deploy

Click **Deploy** in the Vercel dashboard. The first build takes 2-3 minutes.

Watch the build log. Expected output includes:
```
✓ Compiled successfully
✓ Generating static pages (13/13)
```

---

## 5. Update Supabase Auth URLs

After deployment, copy your Vercel URL (e.g., `https://work-expense-xyz.vercel.app`) and update:

1. **Supabase → Auth → URL Configuration:**
   - **Site URL:** `https://work-expense-xyz.vercel.app`
   - **Redirect URLs:** add `https://work-expense-xyz.vercel.app/auth/callback`

2. **Google Console → OAuth 2.0:** add `https://work-expense-xyz.vercel.app/auth/callback` to authorized redirect URIs

3. **Azure App Registration:** add `https://work-expense-xyz.vercel.app/auth/callback` to redirect URIs

---

## 6. Verify Production

1. Open `https://work-expense-xyz.vercel.app`
2. Should redirect to `/login`
3. Test Magic Link sign-in with your email
4. After sign-in, you should land on `/dashboard`
5. Check browser console for any errors

---

## Custom Domain (Optional)

1. **Vercel → Settings → Domains → Add**
2. Add your domain (e.g., `expenses.yourcompany.com`)
3. Add the CNAME record Vercel provides to your DNS
4. Update Supabase and OAuth redirect URLs to use the custom domain

---

## Automatic Deployments

Every `git push` to `main` triggers a new Vercel deployment automatically. Preview deployments are created for every pull request.

Note: Preview deployments will fail auth flows unless their URLs are added to Supabase redirect URLs. For MVP, test on production deployment only.
