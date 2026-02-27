# Pulse Dating App

A modern dating application that connects people in real-time based on their location and preferences.

## Features

- User registration and profile creation
- Real-time location-based matching
- Detailed user profiles with preferences and interests
- Active status management
- Secure messaging system
- Proximity-based notifications

## Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask server:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Spotify OAuth Integration

The app supports connecting your Spotify account to display your top artists on your profile.

### Environment Variables (Backend)

```bash
SPOTIFY_CLIENT_ID=<your-spotify-client-id>
SPOTIFY_CLIENT_SECRET=<your-spotify-client-secret>
SPOTIFY_REDIRECT_URI=https://pulse-dating-app-1.onrender.com/callback
```

### OAuth Flow

1. **User clicks "Connect Spotify"** in Profile Settings
2. **Frontend redirects** to `GET /auth/spotify?user_id=<id>`
3. **Backend generates state** (CSRF protection) and redirects to Spotify authorize URL
4. **User authorizes** on Spotify's consent screen
5. **Spotify redirects** to `/callback` with authorization code
6. **Backend exchanges code** for access_token + refresh_token
7. **Tokens stored** in user's database record
8. **User redirected** back to app with `?spotify=connected`

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/spotify` | GET | Initiate Spotify OAuth flow |
| `/callback` | GET | Spotify OAuth callback handler |
| `/api/spotify/status` | GET | Check if user has Spotify connected |
| `/api/spotify/disconnect` | POST | Disconnect Spotify from account |
| `/api/spotify/top-artists` | GET | Get user's top artists (with auto-refresh) |
| `/api/spotify/top-tracks` | GET | Get user's top tracks (with auto-refresh) |

### Scopes Requested

- `user-top-read` - Access user's top artists and tracks
- `user-read-email` - Access user's email address
- `user-read-private` - Access user's profile info

## Security Note
- The app uses JWT for authentication
- Passwords are hashed using bcrypt
- Location data is only shared when users are actively using the app
- Spotify client secret is never exposed to frontend
- OAuth state parameter prevents CSRF attacks

