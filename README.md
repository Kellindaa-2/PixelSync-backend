# PixelSync-backend

This is the backend for PixelSync. Below are instructions to configure Firebase so the frontend can initialize correctly.

## Firebase configuration

Provide Firebase web config via `firebase/firebaseConfig.json` (development) or by setting environment variables (recommended for production):

- FIREBASE_API_KEY
- FIREBASE_AUTH_DOMAIN
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET
- FIREBASE_MESSAGING_SENDER_ID
- FIREBASE_APP_ID

Use the provided `.env.example` as a template. For Windows PowerShell you can load environment variables for the current session using the helper script:

```powershell
.\set-firebase-env.ps1 -FromDotEnv
# or interactively
.\set-firebase-env.ps1
npm start
```

Verify the server is returning the correct config:

```powershell
(Invoke-WebRequest http://localhost:3000/firebaseConfig).Content | ConvertFrom-Json
```

If the returned `apiKey` is a placeholder like `REPLACE_WITH_YOUR_API_KEY`, the Firebase client will throw `auth/api-key-not-valid`. Make sure the `apiKey` matches the web API key from your Firebase project's settings.
# PixelSync-backend