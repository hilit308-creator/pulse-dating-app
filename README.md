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

## Security Note
- The app uses JWT for authentication
- Passwords are hashed using bcrypt
- Location data is only shared when users are actively using the app
