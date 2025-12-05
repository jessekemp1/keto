# Google Sign-In Setup

Google Sign-In has been implemented! Here's what you need to do to enable it.

## Firebase Console Setup (Required)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ai-keto-tracker**
3. Go to **Build** → **Authentication**
4. Click on the **Sign-in method** tab
5. Click on **Google** provider
6. Toggle **Enable** to ON
7. Enter a **Project support email** (your email)
8. Click **Save**

## Authorized Domains

Firebase automatically adds:
- `localhost` (for development)
- Your Firebase project domain

If deploying to a custom domain, add it in:
- **Authentication** → **Settings** → **Authorized domains**

## How It Works

### For Users:
1. Click **"Sign in with Google"** button on the auth screen
2. Google popup opens
3. Select Google account
4. Grant permissions
5. Automatically signed in and synced!

### Technical Details:
- Uses Firebase `signInWithPopup` (web)
- Creates account automatically if new user
- Signs in if account exists
- Same data sync as email/password
- Works with existing cloud sync

## Testing

1. **Test Sign-In:**
   - Go to Settings → Sign In / Create Account
   - Click "Sign in with Google"
   - Select your Google account
   - Should see success message and be signed in

2. **Test Sign-Out:**
   - Go to Settings (while signed in)
   - Click "Sign Out"
   - Confirm sign out
   - Should see "Signed Out" message
   - Account info should disappear

3. **Test Data Sync:**
   - Sign in with Google
   - Log some metrics
   - Sign out
   - Sign in again (same or different device)
   - Data should be there!

## Troubleshooting

### "Popup blocked" error
- Browser is blocking popups
- Allow popups for localhost
- Or use `signInWithRedirect` (alternative implementation)

### "Operation not allowed" error
- Google provider not enabled in Firebase Console
- Check Authentication → Sign-in method → Google is enabled

### Sign out not working
- Check browser console for errors
- Verify Firebase is initialized
- Check network tab for Firebase requests

## Code Changes Made

1. **`src/services/authService.js`**
   - Added `signInWithGoogle()` function
   - Added Google-specific error handling
   - Improved sign out error handling

2. **`src/screens/AuthScreen.js`**
   - Added Google sign-in button
   - Added divider ("or" separator)
   - Added `handleGoogleSignIn()` function

3. **`src/screens/SettingsScreen.js`**
   - Improved sign out error handling
   - Better user feedback

## Next Steps (Optional)

- Add Google Sign-In for native (iOS/Android) using `expo-auth-session`
- Add other providers (Apple, Facebook, etc.)
- Add "Remember me" functionality
- Add account linking (link Google to existing email account)

