# Fix Google Sign-In on Vercel

## Issue
Google sign-in works locally but not on Vercel (https://keto-weld.vercel.app/)

## Root Cause
Firebase requires authorized domains to be configured in the Firebase Console. The Vercel domain needs to be added.

## Solution

### Step 1: Add Vercel Domain to Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ai-keto-tracker`
3. Go to **Build** → **Authentication**
4. Click on **Settings** tab
5. Scroll to **Authorized domains**
6. Click **"Add domain"**
7. Add: `keto-weld.vercel.app`
8. Click **"Add"**

### Step 2: Verify Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `keto-weld` (or your project name)
3. Go to **Settings** → **Environment Variables**
4. Verify these variables are set:
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`

5. If missing, add them from your `.env` file
6. **Important**: Make sure they're set for **Production** environment
7. After adding/updating, **redeploy** the project

### Step 3: Redeploy on Vercel

After adding the authorized domain and verifying environment variables:

1. In Vercel Dashboard, go to **Deployments**
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger automatic deployment

### Step 4: Test Google Sign-In

1. Visit: https://keto-weld.vercel.app/
2. Click "Sign in with Google"
3. The popup should now work correctly

## Common Issues

### Popup Blocked
- Check browser popup settings
- Try a different browser
- Check browser console for errors

### "auth/popup-closed-by-user"
- User closed the popup window
- This is normal if user cancels

### "auth/unauthorized-domain"
- Domain not added to Firebase authorized domains
- Make sure you added `keto-weld.vercel.app` (not just `vercel.app`)

### Environment Variables Not Loading
- Vercel requires environment variables to be set in dashboard
- `.env` file is not used in Vercel builds
- Must set in Vercel Settings → Environment Variables

## Verification Checklist

- [ ] `keto-weld.vercel.app` added to Firebase authorized domains
- [ ] All Firebase environment variables set in Vercel
- [ ] Environment variables set for Production environment
- [ ] Project redeployed after changes
- [ ] Google Sign-In provider enabled in Firebase Authentication
- [ ] Tested on https://keto-weld.vercel.app/
