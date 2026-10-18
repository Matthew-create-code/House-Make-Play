# House-Make-Play

A mobile-first web app for House-Make & Play, featuring:
- Chapter 1: Google Sign In, onboarding with Username + Display Name, age gate for users under 5
- Chapter 2: Builder Mode warning modal and Active AI Mode prompt box
- Chapter 3: Home tab with Saved Games, Playlists, and Made Games
- Chapter 4: Explore tab to find people, follow them, and send pending friend requests

## Tech stack
- React + Vite + TypeScript
- Tailwind CSS
- Firebase Auth + Firestore ready (demo mode supported without real credentials)

## Local setup
1. Install dependencies:
   npm install
2. Start the app:
   npm run dev
3. Open the local URL shown in the terminal (typically http://localhost:5173)

## Firebase setup (optional)
1. Copy `.env.example` to `.env`
2. Add your Firebase values in `.env`
3. Restart the dev server

## Demo mode
The app runs safely without real Firebase credentials by default. The Google Sign-In button will simulate a Google account in demo mode so you can test the UX immediately.
