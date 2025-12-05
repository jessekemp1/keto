# Vercel Environment Variables Setup

## Quick Reference

Add these **6 environment variables** in Vercel Dashboard:

### How to Add:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `keto-weld` (or your project name)
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"** for each variable below
5. **IMPORTANT**: Select **"Production"** environment for all variables
6. Click **"Save"** after adding each one

### Variables to Add:

| Variable Name | Value |
|--------------|-------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | `AIzaSyA5rnxP3tsHkWOY0Z3GytJCPVt3gNcCdmQ` <!-- gitleaks:allow -->
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `ai-keto-tracker.firebaseapp.com` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | `ai-keto-tracker` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | `ai-keto-tracker.firebasestorage.app` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `347422156966` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | `1:347422156966:web:d46198086cc35c1b5dac67` |

### Copy-Paste Format:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyA5rnxP3tsHkWOY0Z3GytJCPVt3gNcCdmQ  # gitleaks:allow
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-keto-tracker.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ai-keto-tracker
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-keto-tracker.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=347422156966
EXPO_PUBLIC_FIREBASE_APP_ID=1:347422156966:web:d46198086cc35c1b5dac67
```

### After Adding Variables:

1. **Redeploy** your project:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**
   - Or push a new commit to trigger auto-deploy

2. **Verify** the deployment:
   - Check deployment logs for any errors
   - Visit https://keto-weld.vercel.app/
   - Test Google Sign-In

### Where These Values Come From:

These values are from your Firebase project configuration:
- Firebase Console → Project Settings → Your apps → Web app config
- They're also hardcoded as fallbacks in `src/config/firebase.js`

### Troubleshooting:

- **Variables not loading?** Make sure they're set for **Production** environment
- **Still not working?** Check deployment logs in Vercel for errors
- **Need to update?** Change in Vercel dashboard and redeploy
