# 🚀 Deployment Guide: Ladies Suit POS SaaS

This project is now a production-grade SaaS following Senior Architect standards.

## 1. Supabase Setup (Mandatory)
Before deploying, you must configure your Supabase project:

1. **Authentication**:
   - Enable Email/Password provider.
   - Disable "Confirm Email" if you want instant testing (or keep it for production safety).
2. **Storage**:
   - Create a **Public** bucket named `product-images`.
   - Ensure the policy allows "Public Read" and "Authenticated Write/Delete".
3. **API Keys**:
   - Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
   - Get your `SUPABASE_JWT_SECRET` (found in Settings -> API). **Note:** This is the same as the `JWT_SECRET` you should use in the backend.

## 2. Frontend (Vercel)
- **Framework**: Next.js (detected automatically).
- **Root Directory**: `client`
- **Environment Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://ladies-suit-pos.onrender.com/api/v1`)

## 3. Backend (Render)
- **Blueprint**: The `render.yaml` in the root will automatically set up the service and database.
- **Root Directory**: `server`
- **Build Command**: `npm run build`
- **Start Command**: `npm run start:prod`
- **Environment Variables**:
  - `DATABASE_URL`: Your Supabase PostgreSQL URL.
  - `JWT_SECRET`: Your Supabase JWT Secret.
  - `PORT`: 3000

## 4. Final Verification
- Log in to your Supabase dashboard and invite your first **Owner** user.
- Once they log in, they can provision their shop and start adding products!

---
*Developed with ❤️ by Antigravity Senior Architect Team*
