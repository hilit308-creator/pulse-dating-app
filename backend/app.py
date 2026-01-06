from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import jwt
import bcrypt
from geopy.distance import geodesic

from agent import agent_bp

# Admin emails - these users get admin role automatically
ADMIN_EMAILS = [
    'lironi217@gmail.com',
]

app = Flask(__name__)
CORS(app)  # Allow all origins for development

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

@app.route('/api/nearby-users', methods=['GET'])
def get_nearby_users():
    user_id = request.args.get('user_id')
    radius = float(request.args.get('radius', 5.0))  # Default 5km radius
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    nearby_users = []
    all_active_users = User.query.filter_by(is_active=True).all()
    
    for other_user in all_active_users:
        if other_user.id != user.id:
            distance = geodesic(
                (user.latitude, user.longitude),
                (other_user.latitude, other_user.longitude)
            ).kilometers
            
            if distance <= radius:
                nearby_users.append({
                    'id': other_user.id,
                    'first_name': other_user.first_name,
                    'distance': round(distance, 2),
                    'approach_preferences': other_user.approach_preferences
                })
    
    return jsonify(nearby_users)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
