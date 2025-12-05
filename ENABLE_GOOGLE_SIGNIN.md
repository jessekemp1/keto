# Enable Google Sign-In - Quick Steps

## Direct Link
Click this link to go directly to the Google Sign-In settings:
**https://console.firebase.google.com/project/ai-keto-tracker/authentication/providers**

## Step-by-Step Instructions

1. **Click the link above** (or navigate manually):
   - Go to: https://console.firebase.google.com/
   - Sign in with your Google account
   - Select project: **ai-keto-tracker**

2. **Navigate to Authentication:**
   - Click **Build** in the left sidebar
   - Click **Authentication**
   - Click the **Sign-in method** tab

3. **Enable Google:**
   - Find **Google** in the list of providers
   - Click on **Google**
   - Toggle **Enable** to **ON**
   - Enter your **Project support email** (your email address)
   - Click **Save**

4. **Verify:**
   - You should see a green checkmark next to Google
   - Status should show "Enabled"

## That's It!

Once enabled, the "Sign in with Google" button in your app will work immediately.

## Test It

1. Go to your app: http://localhost:19006
2. Navigate to Settings → Sign In / Create Account
3. Click "Sign in with Google"
4. Select your Google account
5. You should be signed in!

## Troubleshooting

If you see "Operation not allowed" error:
- Make sure Google provider is enabled in Firebase Console
- Check that you clicked "Save" after enabling
- Wait 1-2 minutes for changes to propagate

