from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date, timedelta
import jwt
import bcrypt
import math
from geopy.distance import geodesic

from agent import agent_bp

# Admin emails - these users get admin role automatically
ADMIN_EMAILS = [
    'lironi217@gmail.com',
]

app = Flask(__name__)
CORS(app)  # Allow all origins for development
@app.get("/health")
def health():
    return {"status": "ok"}

# Manual CORS headers for all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response
socketio = SocketIO(app, cors_allowed_origins="*")

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dating_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this in production

db = SQLAlchemy(app)

app.register_blueprint(agent_bp)

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    phone_number = db.Column(db.String(20))
    gender = db.Column(db.String(20), nullable=True)
    show_me = db.Column(db.String(20), default='Everyone')  # Men, Women, Everyone
    role = db.Column(db.String(20), default='user')  # user, moderator, admin, super_admin
    residence = db.Column(db.String(100))
    place_of_origin = db.Column(db.String(100))
    looking_for = db.Column(db.String(50))
    relationship_type = db.Column(db.String(50))
    hobbies = db.Column(db.String(1000))
    interests = db.Column(db.String(1000))
    favorite_songs = db.Column(db.String(500))
    approach_preferences = db.Column(db.String(1000))
    custom_approach = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    last_active = db.Column(db.DateTime)


# Like Model - tracks who liked whom
class Like(db.Model):
    __tablename__ = 'likes'
    id = db.Column(db.Integer, primary_key=True)
    liker_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    liked_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    source = db.Column(db.String(50), default='discover')  # 'discover', 'todays_picks', 'nearby'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('liker_id', 'liked_id', name='unique_like'),
    )
    
    liker = db.relationship('User', foreign_keys=[liker_id], backref='likes_given')
    liked = db.relationship('User', foreign_keys=[liked_id], backref='likes_received')


# Match Model - created when two users mutually like each other
class Match(db.Model):
    __tablename__ = 'matches'
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Ensure user1_id < user2_id to prevent duplicate matches
    __table_args__ = (
        db.UniqueConstraint('user1_id', 'user2_id', name='unique_match'),
        db.CheckConstraint('user1_id < user2_id', name='ordered_match_ids'),
    )
    
    user1 = db.relationship('User', foreign_keys=[user1_id])
    user2 = db.relationship('User', foreign_keys=[user2_id])


# Report Model - tracks user reports for safety
class Report(db.Model):
    __tablename__ = 'reports'
    id = db.Column(db.Integer, primary_key=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reported_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, reviewed, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    reporter = db.relationship('User', foreign_keys=[reporter_id])
    reported = db.relationship('User', foreign_keys=[reported_id])


# Block Model - tracks blocked users
class Block(db.Model):
    __tablename__ = 'blocks'
    id = db.Column(db.Integer, primary_key=True)
    blocker_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    blocked_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('blocker_id', 'blocked_id', name='unique_block'),
    )
    
    blocker = db.relationship('User', foreign_keys=[blocker_id])
    blocked = db.relationship('User', foreign_keys=[blocked_id])


# Today's Picks Model - separate selection from Discover
# Picks are generated once per day per user and excluded from Discover
class TodaysPicks(db.Model):
    __tablename__ = 'todays_picks'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # The user receiving picks
    pick_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # The picked profile
    pick_date = db.Column(db.Date, nullable=False)  # Date picks were generated
    meeting_likelihood = db.Column(db.Float, default=0.0)  # Internal score 0.0-1.0
    meeting_context = db.Column(db.String(50))  # 'nearby_now', 'active_today', 'good_timing', null
    dismissed = db.Column(db.Boolean, default=False)  # User liked/passed this pick
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint: one pick per user per profile per day
    __table_args__ = (
        db.UniqueConstraint('user_id', 'pick_user_id', 'pick_date', name='unique_daily_pick'),
    )
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='received_picks')
    pick_user = db.relationship('User', foreign_keys=[pick_user_id])


# Gesture Model - Sweet Gestures (coffee, flowers, gifts)
class Gesture(db.Model):
    __tablename__ = 'gestures'
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    gesture_type = db.Column(db.String(20), nullable=False)  # 'coffee', 'flower', 'gift'
    
    # Item details
    vendor_name = db.Column(db.String(100))  # Cafe name, flower shop, etc.
    vendor_id = db.Column(db.String(50))  # External vendor ID if applicable
    item_name = db.Column(db.String(100))  # Latte, Rose bouquet, Chocolate, etc.
    item_id = db.Column(db.String(50))  # Item identifier
    price = db.Column(db.Float, default=0.0)  # Price in local currency
    currency = db.Column(db.String(10), default='ILS')
    
    # Message
    message = db.Column(db.Text)  # Custom or default message
    
    # Payment info (stored securely - in production use payment provider tokens)
    payment_token = db.Column(db.String(255))  # Payment method token from Stripe/etc
    payment_status = db.Column(db.String(20), default='pending')  # pending, charged, refunded
    
    # Status
    status = db.Column(db.String(20), default='pending')  # pending, accepted, declined, expired
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    responded_at = db.Column(db.DateTime)  # When recipient accepted/declined
    expires_at = db.Column(db.DateTime)  # Auto-expire after X days
    
    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], backref='gestures_sent')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='gestures_received')
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'gesture_type': self.gesture_type,
            'vendor_name': self.vendor_name,
            'item_name': self.item_name,
            'price': self.price,
            'currency': self.currency,
            'message': self.message,
            'status': self.status,
            'payment_status': self.payment_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'responded_at': self.responded_at.isoformat() if self.responded_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
        }


# Create database tables
with app.app_context():
    db.create_all()

@app.route('/api/register', methods=['POST'])
def register():
    try:
        print('Headers:', dict(request.headers))  # Debug headers
        data = request.json
        print('Received registration data:', data)  # Debug log
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Hash the password
        password = data['password'].encode('utf-8')
        password_hash = bcrypt.hashpw(password, bcrypt.gensalt())
        
        # Determine user role (auto-admin for specific emails)
        user_role = 'admin' if data['email'].lower() in [e.lower() for e in ADMIN_EMAILS] else 'user'
        
        # Create new user
        new_user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            password_hash=password_hash,
            gender=data.get('gender', ''),
            show_me=data.get('show_me', 'Everyone'),  # Gender preference for matching
            role=user_role,
            place_of_origin=data.get('place_of_origin', ''),
            hobbies=data.get('hobbies', ''),
            interests=data.get('interests', ''),
            favorite_songs=data.get('favorite_songs', ''),
            approach_preferences=data.get('approach_preferences', '')
        )
        
        print('Creating user:', new_user)  # Debug log
        
        db.session.add(new_user)
        db.session.commit()
        
        print('User created successfully')  # Debug log
        return jsonify({'message': 'User registered successfully'}), 201
        
    except Exception as e:
        print('Error during registration:', str(e))  # Debug log
        db.session.rollback()
        error_msg = f'Registration error: {str(e)}'
        print(error_msg)  # Debug log
        return jsonify({'error': error_msg}), 500
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Demo photo pools - different photos for variety
        woman_photos = [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
        ]
        man_photos = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=800&q=80',
        ]
        
        # Select photos based on user ID for variety
        gender = user.gender or 'Woman'
        if gender == 'Man':
            photo_pool = man_photos
        else:
            photo_pool = woman_photos
        
        # Use user ID to pick different photos for each user
        photo_index = (user.id - 1) % len(photo_pool)
        photos = [
            photo_pool[photo_index],
            photo_pool[(photo_index + 1) % len(photo_pool)],
            photo_pool[(photo_index + 2) % len(photo_pool)],
        ]

        # Demo data pools for richer profiles
        bios = [
            "Coffee lover ☕ | Dog mom 🐕 | Always up for an adventure",
            "Tech enthusiast by day, amateur chef by night. Let's grab dinner!",
            "Yoga instructor | Beach lover | Looking for my adventure partner",
            "Music is my therapy 🎵 | Love hiking and good conversations",
            "Bookworm 📚 | Wine connoisseur 🍷 | Seeking genuine connections",
            "Fitness junkie | Travel addict | Life's too short for bad vibes",
            "Creative soul | Art gallery hopper | Let's explore the city together",
            "Foodie | Netflix binger | Looking for someone to share pizza with",
        ]
        
        jobs = [
            "Software Engineer at Google",
            "Marketing Manager",
            "Graphic Designer",
            "Product Manager at Meta",
            "Entrepreneur",
            "Doctor at Ichilov Hospital",
            "Lawyer",
            "Teacher",
        ]
        
        educations = [
            "Tel Aviv University",
            "Hebrew University",
            "Technion",
            "Ben Gurion University",
            "Reichman University",
            "Bar Ilan University",
        ]
        
        heights = [158, 162, 165, 168, 170, 172, 175, 178, 180, 183, 185]
        
        zodiac_signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        
        languages_pool = [
            ["Hebrew", "English"],
            ["Hebrew", "English", "French"],
            ["Hebrew", "English", "Spanish"],
            ["Hebrew", "English", "Russian"],
            ["Hebrew", "English", "Arabic"],
        ]
        
        causes_pool = [
            ["Animal Rights", "Environment"],
            ["LGBTQ+ Rights", "Mental Health"],
            ["Education", "Poverty"],
            ["Climate Action", "Human Rights"],
        ]
        
        qualities_pool = [
            ["Honesty", "Humor", "Kindness"],
            ["Ambition", "Loyalty", "Intelligence"],
            ["Creativity", "Empathy", "Confidence"],
            ["Patience", "Adventurous", "Caring"],
        ]
        
        prompts_pool = [
            [
                {"question": "A perfect day for me looks like...", "answer": "Morning coffee, beach walk, good food with friends, and sunset drinks"},
                {"question": "I'm looking for someone who...", "answer": "Can make me laugh and isn't afraid to be themselves"},
            ],
            [
                {"question": "My simple pleasures are...", "answer": "Fresh flowers, good music, and homemade pasta"},
                {"question": "The way to win me over is...", "answer": "Be genuine, make me laugh, and love dogs"},
            ],
            [
                {"question": "I geek out on...", "answer": "True crime podcasts, cooking shows, and travel documentaries"},
                {"question": "My most controversial opinion is...", "answer": "Pineapple absolutely belongs on pizza 🍕"},
            ],
        ]
        
        drinking_options = ["Never", "Socially", "Regularly"]
        smoking_options = ["Never", "Sometimes", "Regularly"]
        children_options = ["Don't have kids", "Have kids", "Want kids someday", "Don't want kids"]
        religion_options = ["Jewish", "Secular", "Traditional", "Not religious"]
        politics_options = ["Liberal", "Moderate", "Conservative", "Not political"]
        
        # Use user ID to pick different data for each user
        idx = (user.id - 1) % 8
        
        return jsonify({
            'id': user.id,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'age': 24 + (user.id % 10),  # Ages 24-33
            'gender': user.gender or '',
            'role': user.role or 'user',
            'residence': user.residence or 'Tel Aviv',
            'place_of_origin': user.place_of_origin or '',
            'looking_for': user.looking_for or 'Relationship',
            'relationship_type': user.relationship_type or '',
            'hobbies': user.hobbies or '',
            'interests': user.interests or '["Art", "Music", "Coffee", "Travel", "Fitness"]',
            'favorite_songs': user.favorite_songs or '["Shape of You", "Blinding Lights", "Levitating"]',
            'approach_preferences': user.approach_preferences or '',
            'custom_approach': user.custom_approach or '',
            'is_active': user.is_active if user.is_active is not None else False,
            'last_active': user.last_active.isoformat() if user.last_active else None,
            'latitude': user.latitude if user.latitude is not None else None,
            'longitude': user.longitude if user.longitude is not None else None,
            'photos': photos,
            # Additional demo fields for Full Profile Card
            'bio': bios[idx],
            'job_title': jobs[idx],
            'education': educations[idx % len(educations)],
            'height': heights[idx % len(heights)],
            'zodiac': zodiac_signs[user.id % len(zodiac_signs)],
            'languages': languages_pool[idx % len(languages_pool)],
            'causes': causes_pool[idx % len(causes_pool)],
            'qualities': qualities_pool[idx % len(qualities_pool)],
            'prompts': prompts_pool[idx % len(prompts_pool)],
            'drinking': drinking_options[idx % len(drinking_options)],
            'smoking': smoking_options[idx % len(smoking_options)],
            'children': children_options[idx % len(children_options)],
            'religion': religion_options[idx % len(religion_options)],
            'politics': politics_options[idx % len(politics_options)],
        }), 200
    except Exception as e:
        print(f'Error fetching user {user_id}: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to fetch user: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash):
        token = jwt.encode(
            {'user_id': user.id},
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role or 'user'
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/nearby-users', methods=['GET'])
def get_nearby_users():
    """Get nearby users for the Home screen feed (Discover).
    
    IMPORTANT: Today's Picks are EXCLUDED from Discover for the same day.
    This ensures the two surfaces serve different purposes:
    - Today's Picks = focused, intentional choice for today
    - Discover = exploration
    """
    try:
        # Get query params
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        user_id = request.args.get('user_id', type=int)  # Current user for exclusion
        
        # Get current user's gender preference (show_me)
        current_user = None
        show_me_preference = 'Everyone'
        if user_id:
            current_user = User.query.get(user_id)
            if current_user and current_user.show_me:
                show_me_preference = current_user.show_me
        
        # Get today's picks for this user (to exclude from Discover)
        today = date.today()
        todays_pick_ids = []
        if user_id:
            picks = TodaysPicks.query.filter(
                TodaysPicks.user_id == user_id,
                TodaysPicks.pick_date == today
            ).all()
            todays_pick_ids = [p.pick_user_id for p in picks]
        
        # Build query - exclude today's picks from Discover
        query = User.query.filter(User.is_active == True)
        if todays_pick_ids:
            query = query.filter(~User.id.in_(todays_pick_ids))
        
        # Filter by gender preference (show_me)
        if show_me_preference == 'Men':
            query = query.filter(User.gender == 'Man')
        elif show_me_preference == 'Women':
            query = query.filter(User.gender == 'Woman')
        # 'Everyone' = no gender filter
        
        users = query.order_by(User.last_active.desc()).offset(offset).limit(limit).all()
        
        result = []
        
        # Demo photo pools - different photos for variety
        woman_photos = [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
        ]
        man_photos = [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=800&q=80',
        ]
        
        for user in users:
            # Parse interests if stored as comma-separated strings
            interests = []
            if user.interests:
                interests = [s.strip() for s in user.interests.split(',') if s.strip()]
            
            # Select photos based on user ID for variety
            gender = user.gender or 'Woman'
            if gender == 'Man':
                photo_pool = man_photos
            else:
                photo_pool = woman_photos
            
            # Use user ID to pick different photos for each user
            photo_index = (user.id - 1) % len(photo_pool)
            photos = [
                photo_pool[photo_index],
                photo_pool[(photo_index + 1) % len(photo_pool)],
            ]
            
            # Parse lifestyle data from approach_preferences if available
            lifestyle = {}
            if user.approach_preferences:
                try:
                    lifestyle = dict(item.split(':') for item in user.approach_preferences.split('|') if ':' in item)
                except:
                    pass
            
            # Get age from lifestyle data or use varied default based on user ID
            age = int(lifestyle.get('age', 22 + (user.id % 20)))
            height = int(lifestyle.get('height', 160 + (user.id % 35)))
            
            result.append({
                'id': user.id,
                'firstName': user.first_name or '',
                'lastName': user.last_name or '',
                'age': age,
                'gender': user.gender or '',
                'location': user.residence or '',
                'hometown': user.place_of_origin or '',
                'distanceMeters': 100 + (user.id * 50) % 2000,  # Varied distance 100-2000m
                'bio': user.hobbies or f"Looking for {user.looking_for or 'connection'}",
                'interests': interests[:5],  # Limit to 5 interests
                'lookingFor': user.looking_for or '',
                'relationshipType': user.relationship_type or '',
                'photos': photos,
                'primaryPhotoUrl': photos[0] if photos else '',
                'isActive': user.is_active if user.is_active is not None else False,
                'lastActive': user.last_active.isoformat() if user.last_active else None,
                # New diverse fields
                'height': height,
                'favoriteMusic': user.favorite_songs or '',
                'drinking': lifestyle.get('drinking', ''),
                'smoking': lifestyle.get('smoking', ''),
                'exercise': lifestyle.get('exercise', ''),
                'diet': lifestyle.get('diet', ''),
                'pets': lifestyle.get('pets', ''),
                'kids': lifestyle.get('kids', ''),
                'starSign': lifestyle.get('starSign', ''),
            })
        
        return jsonify({
            'users': result,
            'total': User.query.filter(User.is_active == True).count(),
            'limit': limit,
            'offset': offset,
        }), 200
        
    except Exception as e:
        print(f'Error fetching nearby users: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to fetch users: {str(e)}'}), 500

@app.route('/api/dev/validate-diversity', methods=['GET'])
def validate_diversity():
    """DEV ONLY: Sample 5 random users and return key fields to verify diversity."""
    try:
        users = User.query.filter(User.is_active == True).order_by(db.func.random()).limit(5).all()
        
        result = []
        for user in users:
            # Parse lifestyle data
            lifestyle = {}
            if user.approach_preferences:
                try:
                    lifestyle = dict(item.split(':') for item in user.approach_preferences.split('|') if ':' in item)
                except:
                    pass
            
            result.append({
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}",
                'gender': user.gender,
                'location': user.residence,
                'hometown': user.place_of_origin,
                'lookingFor': user.looking_for,
                'bio': user.hobbies[:80] + '...' if user.hobbies and len(user.hobbies) > 80 else user.hobbies,
                'music': user.favorite_songs,
                'interests': user.interests,
                'age': lifestyle.get('age'),
                'height': lifestyle.get('height'),
                'drinking': lifestyle.get('drinking'),
                'smoking': lifestyle.get('smoking'),
                'exercise': lifestyle.get('exercise'),
                'diet': lifestyle.get('diet'),
            })
        
        return jsonify({
            'message': 'Diversity validation - 5 random users',
            'users': result,
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================================================
# TODAY'S PICKS - Separate selection from Discover
# Optimizes for meeting-likelihood TODAY, not general compatibility
# ============================================================================

def calculate_meeting_likelihood(candidate, current_user_lat=None, current_user_lng=None):
    """
    Calculate meeting-likelihood score (0.0-1.0) based on:
    - Activity recency (30%)
    - Proximity now (35%)
    - Availability signals (25%) - placeholder for future
    - Profile completeness (10%)
    
    Returns: (score, context_label)
    """
    score = 0.0
    now = datetime.utcnow()
    
    # 1. Activity recency (30% weight)
    # Active in last 2 hours = full points, 24h = half, 48h+ = minimal
    if candidate.last_active:
        hours_since_active = (now - candidate.last_active).total_seconds() / 3600
        if hours_since_active < 2:
            score += 0.30
        elif hours_since_active < 6:
            score += 0.22
        elif hours_since_active < 24:
            score += 0.15
        elif hours_since_active < 48:
            score += 0.08
        else:
            score += 0.03
    else:
        score += 0.03  # No activity data
    
    # 2. Proximity (35% weight)
    # Within 500m = full, 2km = good, 5km = moderate, 10km+ = minimal
    distance_km = None
    if current_user_lat and current_user_lng and candidate.latitude and candidate.longitude:
        try:
            distance_km = geodesic(
                (current_user_lat, current_user_lng),
                (candidate.latitude, candidate.longitude)
            ).kilometers
        except:
            distance_km = None
    
    if distance_km is not None:
        if distance_km < 0.5:
            score += 0.35
        elif distance_km < 2:
            score += 0.28
        elif distance_km < 5:
            score += 0.18
        elif distance_km < 10:
            score += 0.10
        else:
            score += 0.05
    else:
        # No location data - use moderate default
        score += 0.15
    
    # 3. Availability signals (25% weight) - placeholder
    # Future: integrate with availability calendar
    # For now, use activity as proxy (active users more likely available)
    if candidate.is_active:
        score += 0.20
    else:
        score += 0.08
    
    # 4. Profile completeness (10% weight)
    completeness_points = 0
    if candidate.hobbies:
        completeness_points += 1
    if candidate.interests:
        completeness_points += 1
    if candidate.favorite_songs:
        completeness_points += 1
    completeness = completeness_points / 3
    score += 0.10 * completeness
    
    # Determine context label based on primary signal
    context = None
    if distance_km is not None and distance_km < 2:
        context = 'nearby_now'
    elif candidate.last_active and (now - candidate.last_active).total_seconds() / 3600 < 6:
        context = 'active_today'
    elif score >= 0.5:
        context = 'good_timing'
    
    return min(score, 1.0), context


def get_photo_for_user(user):
    """Get photos for a user based on gender and ID."""
    woman_photos = [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80',
    ]
    man_photos = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=800&q=80',
    ]
    
    gender = user.gender or 'Woman'
    photo_pool = man_photos if gender == 'Man' else woman_photos
    photo_index = (user.id - 1) % len(photo_pool)
    return [
        photo_pool[photo_index],
        photo_pool[(photo_index + 1) % len(photo_pool)],
    ]


@app.route('/api/todays-picks', methods=['GET'])
def get_todays_picks():
    """
    Get Today's Picks for the current user.
    
    This is a SEPARATE selection from Discover:
    - Optimizes for meeting-likelihood TODAY
    - Picks are generated once per day and cached
    - Picks are excluded from Discover for the same day
    - Returns 3-5 profiles with meetingContext indicator
    
    Query params:
    - user_id: Current user ID (required for demo, would use auth in production)
    - lat: Current latitude (optional, improves proximity scoring)
    - lng: Current longitude (optional, improves proximity scoring)
    """
    try:
        # Get current user (demo: from query param, production: from auth)
        user_id = request.args.get('user_id', type=int)
        current_lat = request.args.get('lat', type=float)
        current_lng = request.args.get('lng', type=float)
        
        today = date.today()
        
        # Check if picks already exist for today
        existing_picks = TodaysPicks.query.filter(
            TodaysPicks.user_id == user_id,
            TodaysPicks.pick_date == today,
            TodaysPicks.dismissed == False
        ).all() if user_id else []
        
        if existing_picks:
            # Return cached picks (already generated today)
            picks_data = []
            for pick in existing_picks:
                user = pick.pick_user
                if not user:
                    continue
                    
                photos = get_photo_for_user(user)
                
                # Parse lifestyle data
                lifestyle = {}
                if user.approach_preferences:
                    try:
                        lifestyle = dict(item.split(':') for item in user.approach_preferences.split('|') if ':' in item)
                    except:
                        pass
                
                age = int(lifestyle.get('age', 22 + (user.id % 20)))
                
                picks_data.append({
                    'id': user.id,
                    'firstName': user.first_name or '',
                    'age': age,
                    'distanceMeters': 100 + (user.id * 50) % 2000,
                    'primaryPhotoUrl': photos[0],
                    'photos': photos,
                    'meetingContext': pick.meeting_context,  # 'nearby_now', 'active_today', 'good_timing', null
                    'bio': user.hobbies or '',
                    'interests': [s.strip() for s in (user.interests or '').split(',') if s.strip()][:5],
                    'lookingFor': user.looking_for or '',
                })
            
            return jsonify({
                'picks': picks_data,
                'generatedAt': existing_picks[0].created_at.isoformat() if existing_picks else None,
                'expiresAt': (datetime.combine(today + timedelta(days=1), datetime.min.time())).isoformat(),
                'cached': True,
            }), 200
        
        # Generate new picks for today
        # Get current user's gender preference
        current_user = User.query.get(user_id) if user_id else None
        show_me_preference = current_user.show_me if current_user and current_user.show_me else 'Everyone'
        
        # Get all active users except current user, filtered by gender preference
        query = User.query.filter(
            User.is_active == True,
            User.id != user_id if user_id else True
        )
        
        # Apply gender filter based on show_me preference
        if show_me_preference == 'Men':
            query = query.filter(User.gender == 'Man')
        elif show_me_preference == 'Women':
            query = query.filter(User.gender == 'Woman')
        
        candidates = query.all()
        
        if not candidates:
            return jsonify({
                'picks': [],
                'generatedAt': datetime.utcnow().isoformat(),
                'expiresAt': (datetime.combine(today + timedelta(days=1), datetime.min.time())).isoformat(),
                'cached': False,
            }), 200
        
        # Calculate meeting-likelihood for each candidate
        scored_candidates = []
        for candidate in candidates:
            score, context = calculate_meeting_likelihood(candidate, current_lat, current_lng)
            scored_candidates.append((candidate, score, context))
        
        # Sort by score descending and take top 5
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        top_picks = scored_candidates[:5]
        
        # Ensure minimum of 3 picks if available
        if len(top_picks) < 3 and len(scored_candidates) >= 3:
            top_picks = scored_candidates[:3]
        
        # Store picks in database for the day
        picks_data = []
        for candidate, score, context in top_picks:
            # Create pick record
            if user_id:
                pick_record = TodaysPicks(
                    user_id=user_id,
                    pick_user_id=candidate.id,
                    pick_date=today,
                    meeting_likelihood=score,
                    meeting_context=context,
                )
                db.session.add(pick_record)
            
            photos = get_photo_for_user(candidate)
            
            # Parse lifestyle data
            lifestyle = {}
            if candidate.approach_preferences:
                try:
                    lifestyle = dict(item.split(':') for item in candidate.approach_preferences.split('|') if ':' in item)
                except:
                    pass
            
            age = int(lifestyle.get('age', 22 + (candidate.id % 20)))
            
            picks_data.append({
                'id': candidate.id,
                'firstName': candidate.first_name or '',
                'age': age,
                'distanceMeters': 100 + (candidate.id * 50) % 2000,
                'primaryPhotoUrl': photos[0],
                'photos': photos,
                'meetingContext': context,
                'bio': candidate.hobbies or '',
                'interests': [s.strip() for s in (candidate.interests or '').split(',') if s.strip()][:5],
                'lookingFor': candidate.looking_for or '',
            })
        
        if user_id:
            db.session.commit()
        
        return jsonify({
            'picks': picks_data,
            'generatedAt': datetime.utcnow().isoformat(),
            'expiresAt': (datetime.combine(today + timedelta(days=1), datetime.min.time())).isoformat(),
            'cached': False,
        }), 200
        
    except Exception as e:
        print(f'Error fetching today\'s picks: {str(e)}')
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': f'Failed to fetch picks: {str(e)}'}), 500


@app.route('/api/todays-picks/<int:pick_user_id>/dismiss', methods=['POST'])
def dismiss_todays_pick(pick_user_id):
    """
    Mark a Today's Pick as dismissed (user liked or passed).
    The pick will no longer appear in Today's Picks but remains excluded from Discover.
    """
    try:
        user_id = request.args.get('user_id', type=int)
        today = date.today()
        
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400
        
        pick = TodaysPicks.query.filter(
            TodaysPicks.user_id == user_id,
            TodaysPicks.pick_user_id == pick_user_id,
            TodaysPicks.pick_date == today
        ).first()
        
        if pick:
            pick.dismissed = True
            db.session.commit()
            return jsonify({'success': True, 'dismissed': True}), 200
        else:
            return jsonify({'success': False, 'error': 'Pick not found'}), 404
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================================================
# LIKES & MATCHES API
# Server-side persistence for likes and automatic match creation
# ============================================================================

@app.route('/api/likes', methods=['POST'])
def create_like():
    """
    Record a like from one user to another.
    If mutual like exists, automatically creates a Match.
    Returns: { success, isMatch, matchId? }
    """
    try:
        data = request.json
        liker_id = data.get('liker_id')
        liked_id = data.get('liked_id')
        source = data.get('source', 'discover')  # 'discover', 'todays_picks', 'nearby'
        
        if not liker_id or not liked_id:
            return jsonify({'error': 'liker_id and liked_id required'}), 400
        
        if liker_id == liked_id:
            return jsonify({'error': 'Cannot like yourself'}), 400
        
        # Check if like already exists
        existing_like = Like.query.filter_by(liker_id=liker_id, liked_id=liked_id).first()
        if existing_like:
            return jsonify({'success': True, 'isMatch': False, 'message': 'Already liked'}), 200
        
        # Create the like
        new_like = Like(liker_id=liker_id, liked_id=liked_id, source=source)
        db.session.add(new_like)
        
        # Check for mutual like (the other person already liked this user)
        mutual_like = Like.query.filter_by(liker_id=liked_id, liked_id=liker_id).first()
        
        is_match = False
        match_id = None
        
        if mutual_like:
            # Create a match! Ensure user1_id < user2_id for uniqueness
            user1, user2 = (liker_id, liked_id) if liker_id < liked_id else (liked_id, liker_id)
            
            # Check if match already exists
            existing_match = Match.query.filter_by(user1_id=user1, user2_id=user2).first()
            if not existing_match:
                new_match = Match(user1_id=user1, user2_id=user2)
                db.session.add(new_match)
                db.session.flush()  # Get the ID
                match_id = new_match.id
                is_match = True
                print(f'[Likes] Match created! user1={user1}, user2={user2}, match_id={match_id}')
            else:
                match_id = existing_match.id
                is_match = True
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'isMatch': is_match,
            'matchId': match_id,
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f'[Likes] Error creating like: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/matches', methods=['GET'])
def get_matches():
    """
    Get all matches for a user.
    Returns: { matches: [{ id, matchedUser, createdAt }] }
    """
    try:
        user_id = request.args.get('user_id', type=int)
        
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400
        
        # Find all matches where user is either user1 or user2
        matches = Match.query.filter(
            (Match.user1_id == user_id) | (Match.user2_id == user_id)
        ).order_by(Match.created_at.desc()).all()
        
        matches_data = []
        for match in matches:
            # Get the other user in the match
            other_user_id = match.user2_id if match.user1_id == user_id else match.user1_id
            other_user = User.query.get(other_user_id)
            
            if other_user:
                # Calculate age
                age = 25  # Default
                
                # Get photos (demo)
                photos = [
                    f"https://images.unsplash.com/photo-{1500000000000 + other_user.id}?auto=format&fit=crop&w=800&q=80"
                ]
                
                matches_data.append({
                    'id': match.id,
                    'matchedUser': {
                        'id': other_user.id,
                        'firstName': other_user.first_name,
                        'lastName': other_user.last_name,
                        'age': age,
                        'primaryPhotoUrl': photos[0],
                        'photos': photos,
                        'bio': other_user.hobbies or '',
                    },
                    'createdAt': match.created_at.isoformat(),
                })
        
        return jsonify({'matches': matches_data}), 200
        
    except Exception as e:
        print(f'[Matches] Error fetching matches: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/likes/received', methods=['GET'])
def get_received_likes():
    """
    Get all likes received by a user (people who liked them).
    Excludes users who the current user has already liked (those are matches).
    """
    try:
        user_id = request.args.get('user_id', type=int)
        
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400
        
        # Get IDs of users this user has already liked
        liked_by_user = db.session.query(Like.liked_id).filter(Like.liker_id == user_id).subquery()
        
        # Get likes received, excluding mutual likes
        received_likes = Like.query.filter(
            Like.liked_id == user_id,
            ~Like.liker_id.in_(liked_by_user)
        ).order_by(Like.created_at.desc()).all()
        
        likes_data = []
        for like in received_likes:
            liker = User.query.get(like.liker_id)
            if liker:
                photos = [
                    f"https://images.unsplash.com/photo-{1500000000000 + liker.id}?auto=format&fit=crop&w=800&q=80"
                ]
                likes_data.append({
                    'id': like.id,
                    'user': {
                        'id': liker.id,
                        'firstName': liker.first_name,
                        'primaryPhotoUrl': photos[0],
                    },
                    'createdAt': like.created_at.isoformat(),
                })
        
        return jsonify({'likes': likes_data, 'count': len(likes_data)}), 200
        
    except Exception as e:
        print(f'[Likes] Error fetching received likes: {str(e)}')
        return jsonify({'error': str(e)}), 500


# ============================================================================
# SAFETY API - Reports and Blocks
# ============================================================================

@app.route('/api/reports', methods=['POST'])
def create_report():
    """
    Report a user for safety concerns.
    Also automatically blocks the reported user.
    """
    try:
        data = request.json
        reporter_id = data.get('reporter_id')
        reported_id = data.get('reported_id')
        reason = data.get('reason', '')
        
        if not reporter_id or not reported_id:
            return jsonify({'error': 'reporter_id and reported_id required'}), 400
        
        if not reason.strip():
            return jsonify({'error': 'reason required'}), 400
        
        # Create the report
        report = Report(
            reporter_id=reporter_id,
            reported_id=reported_id,
            reason=reason,
        )
        db.session.add(report)
        
        # Also block the user
        existing_block = Block.query.filter_by(blocker_id=reporter_id, blocked_id=reported_id).first()
        if not existing_block:
            block = Block(blocker_id=reporter_id, blocked_id=reported_id)
            db.session.add(block)
        
        db.session.commit()
        
        print(f'[Safety] User {reporter_id} reported user {reported_id}: {reason[:50]}...')
        return jsonify({'success': True, 'reportId': report.id}), 201
        
    except Exception as e:
        db.session.rollback()
        print(f'[Safety] Error creating report: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/blocks', methods=['POST'])
def create_block():
    """
    Block a user. They will no longer appear in any lists.
    """
    try:
        data = request.json
        blocker_id = data.get('blocker_id')
        blocked_id = data.get('blocked_id')
        
        if not blocker_id or not blocked_id:
            return jsonify({'error': 'blocker_id and blocked_id required'}), 400
        
        # Check if already blocked
        existing = Block.query.filter_by(blocker_id=blocker_id, blocked_id=blocked_id).first()
        if existing:
            return jsonify({'success': True, 'message': 'Already blocked'}), 200
        
        # Create the block
        block = Block(blocker_id=blocker_id, blocked_id=blocked_id)
        db.session.add(block)
        db.session.commit()
        
        print(f'[Safety] User {blocker_id} blocked user {blocked_id}')
        return jsonify({'success': True, 'blockId': block.id}), 201
        
    except Exception as e:
        db.session.rollback()
        print(f'[Safety] Error creating block: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/blocks', methods=['GET'])
def get_blocks():
    """
    Get list of blocked user IDs for a user.
    """
    try:
        user_id = request.args.get('user_id', type=int)
        
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400
        
        blocks = Block.query.filter_by(blocker_id=user_id).all()
        blocked_ids = [b.blocked_id for b in blocks]
        
        return jsonify({'blockedIds': blocked_ids}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/update-location', methods=['POST'])
def update_location():
    data = request.json
    user = User.query.get(data['user_id'])
    
    if user:
        user.latitude = data['latitude']
        user.longitude = data['longitude']
        user.is_active = data['is_active']
        user.last_active = datetime.utcnow()
        db.session.commit()
        
        # Emit location update to nearby users
        emit('user_location_update', {
            'user_id': user.id,
            'latitude': user.latitude,
            'longitude': user.longitude,
            'is_active': user.is_active
        }, broadcast=True)
        
        return jsonify({'message': 'Location updated'}), 200
    
    return jsonify({'error': 'User not found'}), 404


# =========================
# Sweet Gestures API
# =========================

@app.route('/api/gestures', methods=['POST'])
def create_gesture():
    """
    Create a new gesture (coffee, flower, gift).
    Payment is collected but NOT charged until recipient accepts.
    """
    try:
        data = request.json
        sender_id = data.get('sender_id')
        recipient_id = data.get('recipient_id')
        gesture_type = data.get('gesture_type')  # coffee, flower, gift
        
        if not sender_id or not recipient_id or not gesture_type:
            return jsonify({'error': 'sender_id, recipient_id, and gesture_type required'}), 400
        
        if gesture_type not in ['coffee', 'flower', 'gift']:
            return jsonify({'error': 'Invalid gesture_type. Must be coffee, flower, or gift'}), 400
        
        # Check for existing pending gesture of same type to same recipient
        existing = Gesture.query.filter_by(
            sender_id=sender_id,
            recipient_id=recipient_id,
            gesture_type=gesture_type,
            status='pending'
        ).first()
        
        if existing:
            return jsonify({'error': 'You already have a pending gesture of this type to this person'}), 400
        
        # Create gesture with 7-day expiration
        gesture = Gesture(
            sender_id=sender_id,
            recipient_id=recipient_id,
            gesture_type=gesture_type,
            vendor_name=data.get('vendor_name'),
            vendor_id=data.get('vendor_id'),
            item_name=data.get('item_name'),
            item_id=data.get('item_id'),
            price=data.get('price', 0.0),
            currency=data.get('currency', 'ILS'),
            message=data.get('message'),
            payment_token=data.get('payment_token'),  # From payment provider
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        
        db.session.add(gesture)
        db.session.commit()
        
        # TODO: Send push notification to recipient
        # TODO: Create chat message for recipient
        
        print(f'[Gesture] User {sender_id} sent {gesture_type} to user {recipient_id}')
        return jsonify({'success': True, 'gesture': gesture.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        print(f'[Gesture] Error creating gesture: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/gestures', methods=['GET'])
def get_gestures():
    """
    Get gestures for a user (sent or received).
    Query params: user_id, direction (sent/received/all), status (pending/accepted/declined/expired/all)
    """
    try:
        user_id = request.args.get('user_id', type=int)
        direction = request.args.get('direction', 'all')  # sent, received, all
        status = request.args.get('status', 'all')  # pending, accepted, declined, expired, all
        
        if not user_id:
            return jsonify({'error': 'user_id required'}), 400
        
        query = Gesture.query
        
        # Filter by direction
        if direction == 'sent':
            query = query.filter_by(sender_id=user_id)
        elif direction == 'received':
            query = query.filter_by(recipient_id=user_id)
        else:
            query = query.filter(
                db.or_(Gesture.sender_id == user_id, Gesture.recipient_id == user_id)
            )
        
        # Filter by status
        if status != 'all':
            query = query.filter_by(status=status)
        
        gestures = query.order_by(Gesture.created_at.desc()).all()
        
        return jsonify({'gestures': [g.to_dict() for g in gestures]}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/gestures/<int:gesture_id>/accept', methods=['PATCH'])
def accept_gesture(gesture_id):
    """
    Recipient accepts a gesture.
    This triggers the payment charge to the sender.
    """
    try:
        data = request.json
        user_id = data.get('user_id')  # Must be the recipient
        
        gesture = Gesture.query.get(gesture_id)
        if not gesture:
            return jsonify({'error': 'Gesture not found'}), 404
        
        if gesture.recipient_id != user_id:
            return jsonify({'error': 'Only the recipient can accept this gesture'}), 403
        
        if gesture.status != 'pending':
            return jsonify({'error': f'Gesture is already {gesture.status}'}), 400
        
        # Check if expired
        if gesture.expires_at and datetime.utcnow() > gesture.expires_at:
            gesture.status = 'expired'
            db.session.commit()
            return jsonify({'error': 'Gesture has expired'}), 400
        
        # TODO: Charge the sender's payment method
        # In production: Use Stripe/payment provider to charge the payment_token
        # For now, we simulate success
        gesture.payment_status = 'charged'
        
        gesture.status = 'accepted'
        gesture.responded_at = datetime.utcnow()
        db.session.commit()
        
        # TODO: Send notification to sender
        # TODO: Create chat message confirming acceptance
        
        print(f'[Gesture] Gesture {gesture_id} accepted by user {user_id}')
        return jsonify({'success': True, 'gesture': gesture.to_dict()}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f'[Gesture] Error accepting gesture: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/gestures/<int:gesture_id>/decline', methods=['PATCH'])
def decline_gesture(gesture_id):
    """
    Recipient declines a gesture.
    No charge is made to the sender.
    """
    try:
        data = request.json
        user_id = data.get('user_id')  # Must be the recipient
        
        gesture = Gesture.query.get(gesture_id)
        if not gesture:
            return jsonify({'error': 'Gesture not found'}), 404
        
        if gesture.recipient_id != user_id:
            return jsonify({'error': 'Only the recipient can decline this gesture'}), 403
        
        if gesture.status != 'pending':
            return jsonify({'error': f'Gesture is already {gesture.status}'}), 400
        
        gesture.status = 'declined'
        gesture.responded_at = datetime.utcnow()
        db.session.commit()
        
        # TODO: Send polite notification to sender
        # TODO: Create chat message (non-embarrassing)
        
        print(f'[Gesture] Gesture {gesture_id} declined by user {user_id}')
        return jsonify({'success': True, 'gesture': gesture.to_dict()}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f'[Gesture] Error declining gesture: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/gestures/pending-to-user', methods=['GET'])
def get_pending_gestures_to_user():
    """
    Check if current user has any pending gestures to a specific recipient.
    Used to show "already sent" state in UI.
    """
    try:
        sender_id = request.args.get('sender_id', type=int)
        recipient_id = request.args.get('recipient_id', type=int)
        
        if not sender_id or not recipient_id:
            return jsonify({'error': 'sender_id and recipient_id required'}), 400
        
        pending = Gesture.query.filter_by(
            sender_id=sender_id,
            recipient_id=recipient_id,
            status='pending'
        ).all()
        
        # Return dict of gesture_type -> True for pending gestures
        pending_types = {g.gesture_type: True for g in pending}
        
        return jsonify({'pending': pending_types}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
