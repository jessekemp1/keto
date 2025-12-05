# Firebase Quick Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or use existing project
3. Enter project name: `keto-tracker` (or your choice)
4. Disable Google Analytics (optional, can enable later)
5. Click **"Create project"**

## Step 2: Register Web App

1. In Firebase Console, click the **gear icon** (⚙️) → **Project Settings**
2. Scroll to **"Your apps"** section
3. Click the **Web icon** (`</>`)
4. Register app with nickname: `Keto Tracker Web`
5. **Copy the config object** - you'll need these values

## Step 3: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **"Get started"**
3. Click **"Email/Password"** tab
4. Toggle **"Enable"** and click **"Save"**

## Step 4: Create Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location (closest to you, e.g., `us-central`)
5. Click **"Enable"**

## Step 5: Set Firestore Security Rules

1. In Firestore Database, click **"Rules"** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Metrics subcollection
      match /metrics/{metricId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. Click **"Publish"**

## Step 6: Configure Environment Variables

1. In your project root (`keto-tracker/`), create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase config values:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...your-actual-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Where to find these values:**
- Firebase Console → Project Settings → Your apps → Web app config
- They look like this in the config object:
  ```javascript
  {
    apiKey: "AIzaSy...",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  }
  ```

## Step 7: Restart Development Server

After creating `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npx expo start --web
```

## Step 8: Test Firebase Connection

1. Open the app in browser
2. Go to **Settings** tab
3. Click **"Sign In / Create Account"**
4. Create a test account (e.g., `test@example.com` / `password123`)
5. If sign-up succeeds, Firebase is working! ✅

## Troubleshooting

### "Firebase is not configured" error
- Check `.env` file exists in `keto-tracker/` directory
- Verify all 6 environment variables are set
- Restart the development server after creating `.env`

### Authentication errors
- Verify Email/Password is enabled in Firebase Console
- Check browser console for detailed error messages
- Make sure `.env` values match Firebase Console exactly

### Firestore permission errors
- Check Security Rules are published
- Verify user is signed in before accessing data
- Rules should allow: `request.auth != null && request.auth.uid == userId`

### Data not syncing
- Check browser console for errors
- Verify Firestore database is created
- Check internet connection
- Verify user is signed in (Settings tab shows email)

## Next Steps

Once Firebase is configured:
- ✅ Sign in to enable cloud sync
- ✅ Data will sync across all devices where you're signed in
- ✅ Local data automatically migrates to cloud on first sign-in
- ✅ Works offline with local cache, syncs when online

## Security Note

- `.env` file is already in `.gitignore` (won't be committed)
- Never share your Firebase config publicly
- Firestore rules ensure users can only access their own data

