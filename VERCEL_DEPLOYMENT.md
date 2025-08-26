# Vercel Deployment Configuration for Production

## Overview
This guide ensures your Vercel deployment runs in production mode when code is pushed to the main branch.

## Configuration Files Created

### 1. vercel.json
Created a `vercel.json` file that:
- Sets NODE_ENV to "production"
- Uses the production build command
- Configures the Next.js framework settings

## Vercel Dashboard Settings

To complete the production setup, configure the following in your Vercel dashboard:

### 1. Environment Variables
Go to your project settings in Vercel and add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://dijtowiohxvwdnvgprud.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpanRvd2lvaHh2d2RudmdwcnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNzcyMTcsImV4cCI6MjA2Mjg1MzIxN30.dNAl6RJYfOLmn2s1BMOP2yMyJVD63S1ubGs3neyYCH0
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_SUPABASE_BRANCH=main
NEXT_PUBLIC_PROJECT_ID=dijtowiohxvwdnvgprud
ADMIN_JWT_SECRET=[YOUR_SECURE_PRODUCTION_SECRET]
NEXT_PUBLIC_ENABLE_DEBUG=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NODE_ENV=production
```

**Important:** Replace `[YOUR_SECURE_PRODUCTION_SECRET]` with a secure, unique secret key for production.

### 2. Build & Development Settings
In the Vercel dashboard, ensure these settings:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build:production` (automatically set by vercel.json)
- **Install Command:** `npm install`
- **Output Directory:** `.next` (default for Next.js)

### 3. Git Configuration
- **Production Branch:** main
- **Preview Branches:** Any other branches (development, feature branches, etc.)

## Deployment Process

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Vercel will automatically:**
   - Detect the push to main branch
   - Run `npm install`
   - Execute `npm run build:production` (which copies .env.production to .env.local and builds)
   - Deploy in production mode with NODE_ENV=production

## Verify Production Mode

After deployment, you can verify production mode by:

1. Check the Vercel deployment logs for "Production mode" indicators
2. Visit your deployed site and check:
   - The EnvironmentBadge component should show "PRODUCTION"
   - Check browser console - there should be no React development warnings
   - Check Network tab - bundles should be minified

## Troubleshooting

If the site is still in development mode:

1. **Clear Vercel cache:**
   - Go to Settings → Functions → Clear Cache
   
2. **Redeploy:**
   - Trigger a manual redeploy from the Vercel dashboard
   
3. **Check environment variables:**
   - Ensure all production environment variables are set correctly in Vercel
   
4. **Verify build command:**
   - Check that Vercel is using `npm run build:production` (shown in deployment logs)

## Security Notes

- Never commit `.env.local` to version control
- Keep `ADMIN_JWT_SECRET` secure and different between environments
- Regularly rotate secrets and API keys
- Use Vercel's environment variable encryption for sensitive data

## Support

If issues persist, check:
- Vercel deployment logs
- Browser console for errors
- Network tab for API calls to ensure they're hitting the production Supabase instance