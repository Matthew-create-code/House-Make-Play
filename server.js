const express = require('express');
const app = express();
app.use(express.json());

// Mock database for users
const usersDatabase = {}; 

// 1. AGE VALIDATION CHECKER
function calculateAge(dobString) {
    const birthday = new Date(dobString);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs); 
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// 2. REGISTRATION & ONBOARDING ROUTE
app.post('/api/auth/register', (req, { status }) => {
    const { googleId, displayName, username, dob } = req.body;
    
    // Validate age rule (1, 2, 3, 4, 5 years old cannot play)
    const age = calculateAge(dob);
    if (age <= 5) {
        return status(403).json({ 
            success: false, 
            message: "Access Denied: You must be older than 5 years old to play House-Make & Play." 
        });
    }

    // Save user profile
    usersDatabase[googleId] = {
        displayName,
        username,
        dob,
        isGuest: false,
        chaptersUnlocked: [1]
    };

    return status(200).json({ success: true, user: usersDatabase[googleId] });
});

// 3. MULTI-BUTTON CHOICE ROUTE (For existing accounts)
app.post('/api/auth/decision', (req, res) => {
    const { mode, googleId } = req.body;

    if (mode === 'Guest') {
        return res.json({
            success: true,
            user: { displayName: "Guest Player", username: "guest_mode", isGuest: true }
        });
    }

    if (mode === 'Sign In' || mode === 'Log In') {
        const existingUser = usersDatabase[googleId];
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "Account profile not found. Please register." });
        }
        return res.json({ success: true, user: existingUser });
    }
});// CHAPTER 3: HOME DASHBOARD ROUTE
app.get('/api/home/:userId', (req, res) => {
    const { userId } = req.params;
    const userProfile = usersDatabase[userId];

    if (!userProfile) {
        return res.status(404).json({ 
            success: false, 
            message: "Profile not found. Please log in first." 
        });
    }

    // Return the home items sorted for the dashboard grid
    return res.status(200).json({
        success: true,
        dashboard: {
            savedGames: userProfile.home_dashboard.saved_games,
            playlists: userProfile.home_dashboard.playlists,
            madeGames: userProfile.home_dashboard.made_games
        }
    });
});
