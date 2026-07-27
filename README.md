# Sofia & Campbell — Wedding Registry

A cute, romantic wedding registry for **Sofia Rossi & Campbell Benson** (September 12, 2026). Guests browse honeymoon adventures in the Philippines, home gifts, and contributions toward Max the Golden Retriever — then pay via PayPal in EUR.

Built with **Next.js 15**, **React 19**, and **Tailwind CSS**. Deployable to Vercel in one click.

---

## Quick start

```bash
cd "C:\Users\Sofia Rossi\Projects\sofia-campbell-registry"
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Configuration

Copy `.env.example` to `.env.local`:

| Variable | Description |
|----------|-------------|
| `PAYPAL_USERNAME` | PayPal.me username (default: `sofiaandcampbell`) |
| `PAYPAL_EMAIL` | PayPal **business email** — recommended; enables return URL after payment |
| `NEXT_PUBLIC_SITE_URL` | Public URL, e.g. `https://your-registry.vercel.app` |
| `UPSTASH_REDIS_REST_URL` | Optional — Upstash Redis for shared sold-out state |
| `UPSTASH_REDIS_REST_TOKEN` | Optional — Upstash Redis token |
| `RESEND_API_KEY` | **Required on Vercel for claim emails** — get one at [resend.com](https://resend.com) → API Keys |
| `NOTIFICATION_EMAIL` | Optional — override recipient (default: `sorossi93@gmail.com`) |
| `RESEND_FROM_EMAIL` | Optional — sender address (default: `onboarding@resend.dev`; verify your domain in Resend for production) |
| `TEST_EMAIL_SECRET` | Optional — enables `GET /api/test-email?secret=…` on production to verify Resend setup |

### Claim notification emails (Resend)

When a guest marks a gift as claimed, the app sends an email to `sorossi93@gmail.com` (or `NOTIFICATION_EMAIL`).

**If you get no emails after claiming gifts:**

1. **Set `RESEND_API_KEY` on Vercel** — Project → Settings → Environment Variables. Without it, the server logs `[claim-email] RESEND_API_KEY not set` and skips email silently. **Redeploy after adding env vars.**
2. **Default sender is `onboarding@resend.dev`** — Resend’s sandbox only delivers to the email you used to sign up for Resend. Either:
   - Sign up at [resend.com](https://resend.com) with `sorossi93@gmail.com`, **or**
   - Verify a domain in Resend and set `RESEND_FROM_EMAIL` (e.g. `Registry <notify@yourdomain.com>`).
3. **Check Vercel function logs** — Deployments → your deployment → Logs. Look for `[claim-email]` lines (success or error).
4. **Test locally** — add `RESEND_API_KEY` to `.env.local`, run `npm run dev`, claim a gift; the API response includes `emailNotification` in development.
5. **Test on production** — set `TEST_EMAIL_SECRET` on Vercel, then visit `https://your-site.vercel.app/api/test-email?secret=YOUR_SECRET`.

### PayPal setup

**Option A — Business email (recommended)**

1. Create a [PayPal Business account](https://www.paypal.com).
2. Set `PAYPAL_EMAIL` in `.env.local`.
3. Guests pay with pre-filled EUR amount, item name (gift + giver), and return to `/thank-you`.

**Option B — PayPal.me**

1. Set up [PayPal.me](https://www.paypal.com/paypalme/) (e.g. `paypal.me/sofiaandcampbell`).
2. Set `PAYPAL_USERNAME=sofiaandcampbell`, leave `PAYPAL_EMAIL` empty.
3. Amount is pre-filled; return URL is less reliable — guests may need to visit the registry thank-you link manually.

### Sold-out tracking

When a guest returns from PayPal to `/thank-you`, the app marks the gift as claimed via `POST /api/claims`.

| Storage | Use case |
|---------|----------|
| `data/claims.json` | Local dev (default) |
| **Upstash Redis** | Production on Vercel — shared across all guests |

Create a free Redis database at [console.upstash.com](https://console.upstash.com) and add the env vars to Vercel.

---

## Deploy to Vercel

1. Push to GitHub.
2. Import at [vercel.com/new](https://vercel.com/new).
3. Add environment variables from `.env.example`.
4. Deploy.
5. Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL.

```bash
npm run build
npm run start
```

---

## Link from Appy Couple

1. Deploy and copy your public URL.
2. Open your [Appy Couple dashboard](https://www.appycouple.com) → **Gifts** section.
3. Add a custom/external link: *"Browse our full gift registry →"*
4. Guests need **no login** — anyone with the link can browse and pay.

---

## File structure

```
sofia-campbell-registry/
├── data/claims.json              # Local sold-out storage (dev)
├── src/
│   ├── app/
│   │   ├── api/claims/           # GET/POST sold-out state
│   │   ├── api/paypal-url/       # Build PayPal redirect
│   │   ├── thank-you/            # Post-payment page
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/               # Hero, GiftCard, Modal, etc.
│   ├── data/gifts.ts             # All gifts — edit here
│   └── lib/                      # config, paypal, storage
├── .env.example
├── package.json
└── README.md
```

---

## Gift sections

- **Honeymoon Adventures** — Philippines itinerary (Siargao, Sohoton, El Nido, sunset yacht, jellyfish swim, spa, etc.). Cebu whale shark watching is **not** included.
- **Home & Kitchen** — Plates, cutlery, wine glasses, homeware (€50–€500).
- **Max the Golden Retriever** — Split contributions with the Campbell-not-noticing joke.

---

## Limitations

| Topic | Detail |
|-------|--------|
| Sold-out timing | Marked when guest returns from PayPal, not on payment alone |
| PayPal.me | No automatic return URL — use `PAYPAL_EMAIL` for best flow |
| Vercel without Redis | In-memory fallback is ephemeral — configure Upstash for production |
| PayPal IPN | Not implemented — use return URL + PayPal email notifications |

---

With love, Sofia & Campbell 💕
