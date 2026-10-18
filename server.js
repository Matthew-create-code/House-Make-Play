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
// 1. GET USER PROFILE AND MADE GAMES
app.get('/api/explore/profile/:targetUserId', (req, res) => {
    const target = usersDatabase[req.params.targetUserId];
    if (!target) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
        success: true,
        profile: {
            username: target.username,
            displayName: target.displayName,
            madeGames: target.home_dashboard?.made_games || []
        }
    });
});

// 2. FOLLOW A USER
app.post('/api/explore/follow', (req, res) => {
    const { userId, targetUserId } = req.body;
    
    if (!usersDatabase[userId] || !usersDatabase[targetUserId]) {
        return res.status(404).json({ success: false, message: "User session invalid" });
    }

    // Add to following array safely
    if (!usersDatabase[userId].social.following.includes(targetUserId)) {
        usersDatabase[userId].social.following.push(targetUserId);
    }

    return res.status(200).json({ success: true, message: "Successfully followed player!" });
});

// 3. SEND FRIEND REQUEST (PENDING ACCEPTANCE)
app.post('/api/explore/friend-request/send', (req, res) => {
    const { fromUserId, toUserId } = req.body;

    if (!usersDatabase[fromUserId] || !usersDatabase[toUserId]) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    // Add to pending outbound for sender
    usersDatabase[fromUserId].social.friend_requests.sent.push(toUserId);
    // Add to pending inbound for receiver
    usersDatabase[toUserId].social.friend_requests.received.push(fromUserId);

    return res.status(200).json({ success: true, status: "Pending Acceptance" });
});
// Inside your index.html API connection script logic:
const BACKEND_URL = "https://your-deployed-backend-app.com"; // Replace with your live API server address

// Connect to Chapter 1 Account Router
fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(userData)
});
