from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime, date, timedelta
import jwt
import bcrypt
import math
from geopy.distance import geodesic
import json
import os
import re
import uuid
import requests

from dotenv import load_dotenv

from agent import agent_bp

load_dotenv()

# ============================================================================
# STARTUP LOGGING - Log DB identifier for debugging
# ============================================================================
def get_safe_db_identifier():
    """Return safe DB identifier (host + dbname, no credentials)"""
    db_url = os.getenv('DATABASE_URL', '')
    if not db_url:
        return {'db_type': 'sqlite', 'db_name': 'dating_app.db'}
    try:
        # Parse postgresql://user:pass@host:port/dbname
        import re
        match = re.match(r'postgres(?:ql)?://[^@]+@([^:/]+)(?::\d+)?/([^?]+)', db_url)
        if match:
            return {'db_type': 'postgresql', 'db_host': match.group(1), 'db_name': match.group(2)}
    except:
        pass
    return {'db_type': 'unknown', 'db_hash': hash(db_url) % 10000}

_DB_INFO = get_safe_db_identifier()
print(f'[STARTUP] Database: {_DB_INFO}')
print(f'[STARTUP] Environment: {os.getenv("RENDER", "local")}')
print(f'[STARTUP] Frontend URL: {os.getenv("FRONTEND_URL", "not set")}')

# Admin emails - these users get admin role automatically
ADMIN_EMAILS = [
    'lironi217@gmail.com',
]

app = Flask(__name__)
# CORS configuration - allow credentials for cookie-based auth
FRONTEND_ORIGINS = [
    'https://pulse-dating-app-1.onrender.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
CORS(app, origins=FRONTEND_ORIGINS, supports_credentials=True)

socketio = SocketIO(app, cors_allowed_origins="*")

database_url = os.getenv('DATABASE_URL')
if database_url and database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql+psycopg://', 1)
elif database_url and database_url.startswith('postgresql://'):
    database_url = database_url.replace('postgresql://', 'postgresql+psycopg://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:///dating_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')

db = SQLAlchemy(app)
migrate = Migrate(app, db)

app.register_blueprint(agent_bp)

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    phone_number = db.Column(db.String(20), unique=True)
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
    # Spotify OAuth tokens
    spotify_access_token = db.Column(db.Text)
    spotify_refresh_token = db.Column(db.Text)
    spotify_token_expires_at = db.Column(db.DateTime)
    # Weekly Rhythm - JSON field for recurring activities and upcoming plans
    user_rhythm = db.Column(db.Text)  # JSON: { visibility, recurring, upcoming }
    
    # SOS Trust Score System
    trust_score = db.Column(db.Float, default=50.0)  # 0-100, starts at 50
    total_helps = db.Column(db.Integer, default=0)
    confirmed_helps = db.Column(db.Integer, default=0)
    unconfirmed_helps = db.Column(db.Integer, default=0)
    abandonment_count = db.Column(db.Integer, default=0)  # cancelled/unavailable/not progressing
    avg_arrival_time = db.Column(db.Float, default=0.0)  # seconds
    total_arrival_time = db.Column(db.Float, default=0.0)  # sum for calculating average
    arrival_count = db.Column(db.Integer, default=0)  # count for calculating average
    points_balance = db.Column(db.Integer, default=0)
    total_sos_requests = db.Column(db.Integer, default=0)  # as requester
    cancelled_requests = db.Column(db.Integer, default=0)  # as requester


class FeatureFlag(db.Model):
    __tablename__ = 'feature_flags'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    env = db.Column(db.String(20), nullable=False)
    key = db.Column(db.String(120), nullable=False)
    value_json = db.Column(db.Text, nullable=False)
    updated_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('env', 'key', name='uniq_feature_flag_env_key'),
    )


class FeatureFlagAuditLog(db.Model):
    __tablename__ = 'feature_flag_audit_logs'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    env = db.Column(db.String(20), nullable=False)
    key = db.Column(db.String(120), nullable=False)
    old_value_json = db.Column(db.Text)
    new_value_json = db.Column(db.Text)
    updated_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    reason = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class VenuePartnerTier(db.Model):
    __tablename__ = 'venue_partner_tiers'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    google_place_id = db.Column(db.String(255), unique=True, nullable=False)
    partner_name = db.Column(db.String(255))
    plan_tier = db.Column(db.String(20), nullable=False)
    priority_override = db.Column(db.Integer)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    starts_at = db.Column(db.DateTime)
    ends_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class ExternalApiUsage(db.Model):
    __tablename__ = 'external_api_usage'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    api_name = db.Column(db.String(60), nullable=False)
    day = db.Column(db.Date, nullable=False)
    count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('api_name', 'day', name='uniq_external_api_usage_api_day'),
    )


class PaymentHold(db.Model):
    __tablename__ = 'payment_holds'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    provider = db.Column(db.String(30), nullable=False, default='mock')
    status = db.Column(db.String(30), nullable=False)
    currency = db.Column(db.String(10), default='ils', nullable=False)
    amount_cents = db.Column(db.Integer, nullable=False)
    provider_hold_id = db.Column(db.String(255), unique=True)
    provider_customer_id = db.Column(db.String(255))
    provider_payment_method_id = db.Column(db.String(255))
    stripe_payment_intent_id = db.Column(db.String(255), unique=True)
    stripe_customer_id = db.Column(db.String(255))
    stripe_payment_method_id = db.Column(db.String(255))
    failure_code = db.Column(db.String(120))
    failure_message = db.Column(db.Text)
    expires_at = db.Column(db.DateTime)
    captured_at = db.Column(db.DateTime)
    released_at = db.Column(db.DateTime)
    metadata_json = db.Column(db.Text, default='{}', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class LedgerEntry(db.Model):
    __tablename__ = 'ledger_entries'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    invite_id = db.Column(db.String(36), db.ForeignKey('nearby_invites.id'))
    meeting_id = db.Column(db.String(36), db.ForeignKey('meetings.id'))
    hold_id = db.Column(db.String(36), db.ForeignKey('payment_holds.id'))
    provider = db.Column(db.String(30))
    event_type = db.Column(db.String(60), nullable=False)
    amount_cents = db.Column(db.Integer)
    currency = db.Column(db.String(10))
    provider_event_id = db.Column(db.String(255), unique=True)
    stripe_event_id = db.Column(db.String(255), unique=True)
    details_json = db.Column(db.Text, default='{}', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class NearbyInvite(db.Model):
    __tablename__ = 'nearby_invites'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    inviter_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    invitee_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    invite_type = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)
    message_text = db.Column(db.Text)
    venue_google_place_id = db.Column(db.String(255))
    venue_snapshot_json = db.Column(db.Text)
    payment_hold_id = db.Column(db.String(36), db.ForeignKey('payment_holds.id'))
    expires_at = db.Column(db.DateTime, nullable=False)
    responded_at = db.Column(db.DateTime)
    idempotency_key = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('inviter_user_id', 'idempotency_key', name='uniq_nearby_invite_idempotency'),
        db.CheckConstraint('inviter_user_id != invitee_user_id', name='chk_inviter_invitee_diff'),
    )


class Meeting(db.Model):
    __tablename__ = 'meetings'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    invite_id = db.Column(db.String(36), db.ForeignKey('nearby_invites.id'), unique=True)
    match_id = db.Column(db.String(255))
    inviter_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    invitee_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    venue_google_place_id = db.Column(db.String(255))
    venue_snapshot_json = db.Column(db.Text)
    status = db.Column(db.String(20), default='scheduled', nullable=False)
    scheduled_for = db.Column(db.DateTime)
    started_at = db.Column(db.DateTime)
    ended_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class MeetingFeedback(db.Model):
    __tablename__ = 'meeting_feedback'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = db.Column(db.String(36), db.ForeignKey('meetings.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    meeting_feel = db.Column(db.String(20))
    venue_rating = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('meeting_id', 'user_id', name='uniq_feedback_meeting_user'),
    )


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


# ============================================================================
# SOS TRUST SCORE + REWARDS SYSTEM
# ============================================================================

# SOS Request Model - tracks SOS help requests
class SOSRequest(db.Model):
    __tablename__ = 'sos_requests'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requester_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    helper_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # Status: searching, assigned, approaching, arrived, awaiting_confirmation, 
    #         resolved_confirmed, resolved_unconfirmed, cancelled, helper_unavailable
    status = db.Column(db.String(30), nullable=False, default='searching')
    
    # Location data
    requester_lat = db.Column(db.Float)
    requester_lng = db.Column(db.Float)
    helper_lat_at_accept = db.Column(db.Float)
    helper_lng_at_accept = db.Column(db.Float)
    distance_at_accept = db.Column(db.Float)  # km
    
    # Timing
    arrival_time_seconds = db.Column(db.Integer)  # Time from accept to arrival
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    accepted_at = db.Column(db.DateTime)
    arrived_at = db.Column(db.DateTime)
    resolved_at = db.Column(db.DateTime)
    
    # Relationships
    requester = db.relationship('User', foreign_keys=[requester_id], backref='sos_requests_made')
    helper = db.relationship('User', foreign_keys=[helper_id], backref='sos_requests_helped')
    
    def to_dict(self):
        return {
            'id': self.id,
            'requester_id': self.requester_id,
            'helper_id': self.helper_id,
            'status': self.status,
            'distance_at_accept': self.distance_at_accept,
            'arrival_time_seconds': self.arrival_time_seconds,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None,
            'arrived_at': self.arrived_at.isoformat() if self.arrived_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
        }


# SOS Reward Model - tracks rewards granted for helping
class SOSReward(db.Model):
    __tablename__ = 'sos_rewards'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    helper_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    requester_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sos_request_id = db.Column(db.String(36), db.ForeignKey('sos_requests.id'), nullable=False, unique=True)  # UNIQUE: One reward per SOS request (idempotency)
    
    # Reward details
    base_amount = db.Column(db.Integer, nullable=False, default=150)
    bonus_amount = db.Column(db.Integer, default=0)
    total_amount = db.Column(db.Integer, nullable=False)
    bonuses_json = db.Column(db.Text)  # JSON: [{ type, amount, label }]
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    helper = db.relationship('User', foreign_keys=[helper_id])
    requester = db.relationship('User', foreign_keys=[requester_id])
    sos_request = db.relationship('SOSRequest', backref='reward')
    
    def to_dict(self):
        return {
            'id': self.id,
            'helper_id': self.helper_id,
            'requester_id': self.requester_id,
            'sos_request_id': self.sos_request_id,
            'base_amount': self.base_amount,
            'bonus_amount': self.bonus_amount,
            'total_amount': self.total_amount,
            'bonuses': json.loads(self.bonuses_json) if self.bonuses_json else [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# Points Transaction Model - tracks all point changes
class PointsTransaction(db.Model):
    __tablename__ = 'points_transactions'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Transaction type: helper_reward, purchase, spend, bonus, adjustment
    type = db.Column(db.String(30), nullable=False)
    amount = db.Column(db.Integer, nullable=False)  # Positive for credit, negative for debit
    
    # Reference to related entity
    reference_id = db.Column(db.String(36))  # SOS reward ID, purchase ID, etc.
    reference_type = db.Column(db.String(30))  # sos_reward, purchase, etc.
    
    # Balance after transaction
    balance_after = db.Column(db.Integer, nullable=False)
    
    # Description
    description = db.Column(db.String(255))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = db.relationship('User', backref='points_transactions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'amount': self.amount,
            'reference_id': self.reference_id,
            'reference_type': self.reference_type,
            'balance_after': self.balance_after,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# Helper Interaction Model - tracks interactions for anti-abuse
class HelperInteraction(db.Model):
    __tablename__ = 'helper_interactions'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    helper_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    requester_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Interaction tracking
    interaction_count = db.Column(db.Integer, default=0)
    last_interaction = db.Column(db.DateTime)
    
    # Weekly tracking for diminishing returns
    weekly_count = db.Column(db.Integer, default=0)
    week_start = db.Column(db.Date)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Unique constraint on helper-requester pair
    __table_args__ = (
        db.UniqueConstraint('helper_id', 'requester_id', name='uniq_helper_requester_pair'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'helper_id': self.helper_id,
            'requester_id': self.requester_id,
            'interaction_count': self.interaction_count,
            'weekly_count': self.weekly_count,
            'last_interaction': self.last_interaction.isoformat() if self.last_interaction else None,
        }


# Create database tables
with app.app_context():
    if os.getenv('PULSE_ENABLE_CREATE_ALL', 'false').lower() == 'true':
        db.create_all()


_NO_PROXIMITY_RE = re.compile(
    r'((\bkm\b|\bkilometers?\b|\bmeters?\b|\bmetres?\b|\bmiles?\b)|'
    r'(\baway\b|\bnearby\b)|'
    r'(\b\d+\s*(km|kilometers?|m|meters?|metres?|mi|miles?)\b))',
    re.IGNORECASE,
)


def _contains_proximity_language(value):
    if value is None:
        return False
    if isinstance(value, str):
        return bool(_NO_PROXIMITY_RE.search(value))
    if isinstance(value, dict):
        return any(_contains_proximity_language(v) for v in value.values())
    if isinstance(value, list):
        return any(_contains_proximity_language(v) for v in value)
    return False


def _get_env_name():
    return os.getenv('PULSE_ENV', os.getenv('FLASK_ENV', 'dev'))


def _default_feature_flags(env_name):
    defaults = {
        'nearby_phase4_venues': False,
        'nearby_phase6_payments': False,
        'nearby_phase7_meeting_setup': False,
        'nearby_phase8_post_meeting_rating': False,
        'payments_enabled': False,
    }
    if env_name in ('dev', 'development', 'local'):
        return defaults
    if env_name in ('stage', 'staging'):
        return defaults
    return defaults


def _payments_provider_name():
    return (os.getenv('PAYMENTS_PROVIDER') or 'mock').strip().lower()


def _payments_enabled():
    # Backward-compatible: older frontend code may still gate on nearby_phase6_payments.
    # Safe defaults remain OFF because both defaults are False.
    return bool(
        get_feature_flag_value('payments_enabled', False)
        or get_feature_flag_value('nearby_phase6_payments', False)
    )


def _get_google_places_key():
    return (os.getenv('GOOGLE_PLACES_API_KEY') or '').strip() or None


def _get_google_places_daily_quota():
    raw = os.getenv('GOOGLE_PLACES_DAILY_QUOTA')
    if raw is None or str(raw).strip() == '':
        return 50
    try:
        n = int(raw)
        return n if n > 0 else 0
    except Exception:
        return 50


def _enforce_daily_quota(api_name, daily_limit):
    if daily_limit is None:
        return True, None
    if daily_limit <= 0:
        return False, (jsonify({'error': 'quota_disabled', 'api': api_name}), 503)

    today = datetime.utcnow().date()
    try:
        row = (
            ExternalApiUsage.query
            .filter_by(api_name=api_name, day=today)
            .with_for_update()
            .first()
        )
        if not row:
            row = ExternalApiUsage(api_name=api_name, day=today, count=0, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
            db.session.add(row)
            db.session.flush()

        if row.count >= daily_limit:
            db.session.rollback()
            return False, (jsonify({'error': 'quota_exceeded', 'api': api_name, 'dailyLimit': daily_limit}), 429)

        row.count = int(row.count or 0) + 1
        row.updated_at = datetime.utcnow()
        db.session.commit()
        return True, None
    except Exception:
        db.session.rollback()
        return False, (jsonify({'error': 'quota_check_failed', 'api': api_name}), 503)


def _map_venue_category_to_places_type(category):
    if not category:
        return None
    c = str(category).strip().lower()
    if c in ('coffee', 'cafe'):
        return 'cafe'
    if c in ('drinks', 'bar'):
        return 'bar'
    if c in ('food', 'restaurant'):
        return 'restaurant'
    if c in ('outdoors', 'park'):
        return 'park'
    return None


def get_feature_flag_value(key, default_value=False):
    env_name = _get_env_name()
    row = FeatureFlag.query.filter_by(env=env_name, key=key).first()
    if not row:
        return _default_feature_flags(env_name).get(key, default_value)
    try:
        parsed = json.loads(row.value_json)
        return bool(parsed)
    except Exception:
        return _default_feature_flags(env_name).get(key, default_value)


def _get_bearer_token():
    auth = request.headers.get('Authorization') or ''
    if not auth.lower().startswith('bearer '):
        return None
    return auth.split(' ', 1)[1].strip()


def get_current_user():
    token = _get_bearer_token()
    if not token:
        print('[Auth] No bearer token in request')
        return None
    try:
        # Debug: check if token looks like a JWT (has 2 dots)
        if token.count('.') != 2:
            print(f'[Auth] Token is NOT a JWT (no 2 dots): {token[:50]}...')
            return None
        # Debug: log SECRET_KEY prefix to verify consistency across deploys
        secret_prefix = app.config['SECRET_KEY'][:8] if len(app.config['SECRET_KEY']) >= 8 else 'SHORT'
        print(f'[Auth] Decoding JWT with SECRET_KEY prefix: {secret_prefix}...')
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload.get('user_id')
        if user_id is None:
            print('[Auth] JWT valid but no user_id in payload')
            return None
        user = User.query.get(int(user_id))
        if user:
            print(f'[Auth] Authenticated user_id={user_id}')
        else:
            print(f'[Auth] user_id={user_id} not found in DB')
        return user
    except jwt.ExpiredSignatureError:
        print('[Auth] JWT expired')
        return None
    except jwt.InvalidSignatureError:
        print('[Auth] JWT invalid signature - wrong secret?')
        return None
    except jwt.DecodeError as e:
        print(f'[Auth] JWT decode error: {e}')
        return None
    except Exception as e:
        print(f'[Auth] Unexpected error: {e}')
        return None


def require_auth():
    user = get_current_user()
    if not user:
        return None, (jsonify({'error': 'unauthorized'}), 401)
    return user, None


def require_admin():
    user, err = require_auth()
    if err:
        return None, err
    if (user.role or 'user') not in ('admin', 'super_admin'):
        return None, (jsonify({'error': 'forbidden'}), 403)
    return user, None


# ============================================================================
# HEALTH CHECK ENDPOINTS
# ============================================================================

@app.route('/health', methods=['GET'])
def health():
    """Basic health check."""
    return jsonify({'status': 'ok'}), 200


@app.route('/health/db', methods=['GET'])
def health_db():
    """Database connection health check."""
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({'db': 'ok'}), 200
    except Exception as e:
        return jsonify({'db': 'error', 'message': str(e)}), 500


# ============================================================================
# LOCATION API
# Update user's GPS coordinates (called on login or when entering Nearby)
# ============================================================================

@app.route('/api/location', methods=['POST'])
def update_location():
    """
    Update current user's location.
    Requires JWT authentication.
    Body: { latitude: float, longitude: float }
    """
    import time
    start_time = time.time()
    
    user, err = require_auth()
    if err:
        return err
    
    data = request.json or {}
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    
    if latitude is None or longitude is None:
        return jsonify({'error': 'latitude and longitude required'}), 400
    
    try:
        lat = float(latitude)
        lng = float(longitude)
        if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
            return jsonify({'error': 'invalid coordinates'}), 400
    except (TypeError, ValueError):
        return jsonify({'error': 'invalid coordinates'}), 400
    
    # Store as floats (not strings)
    user.latitude = lat
    user.longitude = lng
    user.last_active = datetime.utcnow()
    db.session.commit()
    
    # Verify persistence by re-reading from DB
    db.session.refresh(user)
    
    # Debug logging
    latency_ms = int((time.time() - start_time) * 1000)
    print(f'[Location] Updated: user_id={user.id}, lat={user.latitude} (type={type(user.latitude).__name__}), lng={user.longitude} (type={type(user.longitude).__name__}), last_active={user.last_active.isoformat()}, latency={latency_ms}ms')
    
    return jsonify({
        'success': True,
        'latitude': user.latitude,
        'longitude': user.longitude,
        'last_active': user.last_active.isoformat()
    }), 200


@app.after_request
def enforce_no_proximity_language(response):
    if request.path.startswith('/api/v1/'):
        try:
            data = response.get_json(silent=True)
            if _contains_proximity_language(data):
                resp = jsonify({'error': 'server_policy_violation'})
                resp.status_code = 500
                return resp
        except Exception:
            resp = jsonify({'error': 'server_policy_violation'})
            resp.status_code = 500
            return resp
    return response


@app.route('/api/v1/config', methods=['GET'])
def api_v1_config():
    user, err = require_auth()
    if err:
        return err
    env_name = _get_env_name()
    defaults = _default_feature_flags(env_name)
    rows = FeatureFlag.query.filter_by(env=env_name).all()
    db_flags = {}
    for r in rows:
        try:
            db_flags[r.key] = bool(json.loads(r.value_json))
        except Exception:
            continue
    flags = {**defaults, **db_flags}
    return jsonify({'featureFlags': flags})


@app.route('/api/v1/admin/feature-flags/<string:key>', methods=['PUT'])
def api_v1_admin_set_flag(key):
    admin, err = require_admin()
    if err:
        return err
    env_name = _get_env_name()
    body = request.json or {}
    value = body.get('value')
    reason = body.get('reason')
    if value is None:
        return jsonify({'error': 'value_required'}), 400

    existing = FeatureFlag.query.filter_by(env=env_name, key=key).first()
    old_value_json = existing.value_json if existing else None
    new_value_json = json.dumps(bool(value))

    if existing:
        existing.value_json = new_value_json
        existing.updated_by_user_id = admin.id
        existing.updated_at = datetime.utcnow()
    else:
        existing = FeatureFlag(
            env=env_name,
            key=key,
            value_json=new_value_json,
            updated_by_user_id=admin.id,
            updated_at=datetime.utcnow(),
            created_at=datetime.utcnow(),
        )
        db.session.add(existing)

    audit = FeatureFlagAuditLog(
        env=env_name,
        key=key,
        old_value_json=old_value_json,
        new_value_json=new_value_json,
        updated_by_user_id=admin.id,
        reason=reason,
        created_at=datetime.utcnow(),
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({'ok': True, 'key': key, 'value': bool(value)})


# Default radius for nearby search (in km)
DEFAULT_RADIUS_KM = 25

def _calc_distance_meters(lat1, lng1, lat2, lng2):
    """Calculate distance between two coordinates in meters.
    Returns None if any coordinate is missing.
    """
    if lat1 is None or lng1 is None or lat2 is None or lng2 is None:
        return None
    try:
        distance_km = geodesic((lat1, lng1), (lat2, lng2)).kilometers
        return int(distance_km * 1000)
    except Exception:
        return None

@app.route('/api/v1/nearby/users', methods=['GET'])
def api_v1_nearby_users():
    """
    Get nearby users based on real GPS coordinates.
    Query params:
      - radius: max distance in km (default: 25)
      - limit: max results (default: 50)
    Returns: { success: bool, count: int, users: [...] }
    """
    import time
    start_time = time.time()
    
    user, err = require_auth()
    if err:
        return err
    
    # Get query params
    radius_km = request.args.get('radius', DEFAULT_RADIUS_KM, type=float)
    limit = request.args.get('limit', 50, type=int)
    
    # Validate radius
    if radius_km <= 0 or radius_km > 100:
        radius_km = DEFAULT_RADIUS_KM
    
    # Log request
    print(f'[Nearby] Request from user_id={user.id}, lat={user.latitude}, lng={user.longitude}, radius={radius_km}km')
    
    # Check if requesting user has location
    if user.latitude is None or user.longitude is None:
        print(f'[Nearby] User {user.id} has no location set')
        return jsonify({
            'success': False,
            'error': 'location_required',
            'message': 'Please enable location to see nearby users',
            'count': 0,
            'users': []
        }), 200
    
    # Get current user's gender preference
    show_me_preference = user.show_me or 'Everyone'
    
    # Build base query - exclude self, only active users with location
    query = User.query.filter(
        User.id != user.id,
        User.is_active == True,
        User.latitude.isnot(None),
        User.longitude.isnot(None)
    )
    
    # Filter by gender preference
    if show_me_preference == 'Men':
        query = query.filter(User.gender == 'Man')
    elif show_me_preference == 'Women':
        query = query.filter(User.gender == 'Woman')
    
    # Get candidates (we'll filter by distance in Python for accuracy)
    # First, do a rough bounding box filter in SQL for performance
    lat_delta = radius_km / 111.0  # ~111km per degree latitude
    lng_delta = radius_km / (111.0 * abs(math.cos(math.radians(user.latitude))))
    
    query = query.filter(
        User.latitude.between(user.latitude - lat_delta, user.latitude + lat_delta),
        User.longitude.between(user.longitude - lng_delta, user.longitude + lng_delta)
    )
    
    candidates = query.order_by(User.last_active.desc()).limit(limit * 2).all()
    
    # Calculate actual distance and filter
    results = []
    for candidate in candidates:
        try:
            distance_km = geodesic(
                (user.latitude, user.longitude),
                (candidate.latitude, candidate.longitude)
            ).kilometers
        except Exception as e:
            print(f'[Nearby] Distance calc error for user {candidate.id}: {e}')
            continue
        
        # Filter by radius
        if distance_km > radius_km:
            continue
        
        # Convert to meters for response
        distance_meters = int(distance_km * 1000)
        
        # Build user object
        results.append({
            'id': candidate.id,
            'firstName': candidate.first_name or '',
            'lastName': (candidate.last_name or '')[:1] + '.' if candidate.last_name else '',
            'age': 25,  # TODO: calculate from DOB when available
            'gender': candidate.gender or '',
            'distanceMeters': distance_meters,
            'distanceKm': round(distance_km, 2),
            'bio': candidate.hobbies or '',
            'interests': [s.strip() for s in (candidate.interests or '').split(',') if s.strip()][:5],
            'isActive': candidate.is_active,
            'lastActive': candidate.last_active.isoformat() if candidate.last_active else None,
            'photos': [],  # TODO: add real photos
            'primaryPhotoUrl': '',
        })
        
        # Log each result
        print(f'[Nearby]   - user_id={candidate.id}, distance={round(distance_km, 2)}km')
        
        if len(results) >= limit:
            break
    
    # Sort by distance
    results.sort(key=lambda x: x['distanceMeters'])
    
    # Log summary
    latency_ms = int((time.time() - start_time) * 1000)
    print(f'[Nearby] Response: user_id={user.id}, count={len(results)}, latency={latency_ms}ms')
    
    return jsonify({
        'success': True,
        'count': len(results),
        'users': results,
        'requestingUser': {
            'id': user.id,
            'latitude': user.latitude,
            'longitude': user.longitude,
        },
        'radiusKm': radius_km,
    }), 200


@app.route('/api/v1/nearby/venues', methods=['GET'])
def api_v1_nearby_venues():
    user, err = require_auth()
    if err:
        return err
    if not get_feature_flag_value('nearby_phase4_venues', False):
        return jsonify({'items': []})

    key = _get_google_places_key()
    if not key:
        return jsonify({'error': 'places_not_configured'}), 503

    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
    except Exception:
        lat = None
        lng = None

    if lat is None or lng is None:
        if user.latitude is None or user.longitude is None:
            return jsonify({'error': 'lat_lng_required'}), 400
        lat = float(user.latitude)
        lng = float(user.longitude)

    radius_m = request.args.get('radiusMeters', default=1200, type=int)
    radius_m = max(100, min(int(radius_m or 1200), 2000))
    category = request.args.get('category')
    places_type = _map_venue_category_to_places_type(category)

    ok, quota_err = _enforce_daily_quota('google_places_nearbysearch', _get_google_places_daily_quota())
    if not ok:
        return quota_err

    # Places API (New) - uses POST with JSON body and API key in header
    url = 'https://places.googleapis.com/v1/places:searchNearby'
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.types,places.currentOpeningHours',
    }
    body = {
        'locationRestriction': {
            'circle': {
                'center': {'latitude': lat, 'longitude': lng},
                'radius': float(radius_m),
            }
        },
        'maxResultCount': 20,
    }
    if places_type:
        body['includedTypes'] = [places_type]

    try:
        resp = requests.post(url, headers=headers, json=body, timeout=8)
    except Exception:
        return jsonify({'error': 'places_request_failed'}), 502

    if resp.status_code == 400:
        try:
            err_data = resp.json()
            return jsonify({'error': 'places_bad_request', 'details': err_data.get('error', {}).get('message')}), 400
        except Exception:
            return jsonify({'error': 'places_bad_request'}), 400

    if resp.status_code not in (200, 204):
        return jsonify({'error': 'places_http_error', 'status_code': resp.status_code}), 502

    if resp.status_code == 204 or not resp.content:
        return jsonify({'items': []})

    try:
        payload = resp.json()
    except Exception:
        return jsonify({'error': 'places_bad_response'}), 502

    places = payload.get('places') or []
    items = []
    for p in places:
        place_id = p.get('id')
        if not place_id:
            continue
        display_name = p.get('displayName') or {}
        current_hours = p.get('currentOpeningHours') or {}
        snapshot = {
            'name': display_name.get('text'),
            'rating': p.get('rating'),
            'userRatingsTotal': p.get('userRatingCount'),
            'types': p.get('types') or [],
            'openNow': current_hours.get('openNow'),
        }
        items.append({
            'googlePlaceId': place_id,
            'snapshot': snapshot,
        })

    return jsonify({'items': items})


@app.route('/api/v1/nearby/invites', methods=['GET'])
def api_v1_list_invites():
    user, err = require_auth()
    if err:
        return err
    scope = request.args.get('scope', 'incoming')
    status = request.args.get('status')
    q = NearbyInvite.query
    if scope == 'outgoing':
        q = q.filter_by(inviter_user_id=user.id)
    else:
        q = q.filter_by(invitee_user_id=user.id)
    if status:
        q = q.filter_by(status=status)
    items = q.order_by(NearbyInvite.created_at.desc()).limit(50).all()
    out = []
    for i in items:
        venue = None
        if i.venue_google_place_id:
            try:
                venue = {
                    'googlePlaceId': i.venue_google_place_id,
                    'snapshot': json.loads(i.venue_snapshot_json) if i.venue_snapshot_json else None,
                }
            except Exception:
                venue = {'googlePlaceId': i.venue_google_place_id, 'snapshot': None}
        out.append({
            'id': i.id,
            'status': i.status,
            'type': i.invite_type,
            'expiresAt': i.expires_at.isoformat() if i.expires_at else None,
            'venue': venue,
            'paymentHoldId': i.payment_hold_id,
        })
    return jsonify({'items': out})


@app.route('/api/v1/nearby/invites', methods=['POST'])
def api_v1_create_invite():
    user, err = require_auth()
    if err:
        return err
    body = request.json or {}
    invitee_user_id = body.get('inviteeUserId')
    invite_type = body.get('type')
    message = body.get('message')
    venue = body.get('venue') or None

    if not invitee_user_id or not invite_type:
        return jsonify({'error': 'invalid_request'}), 400

    idem_key = request.headers.get('Idempotency-Key')
    if idem_key:
        existing = NearbyInvite.query.filter_by(inviter_user_id=user.id, idempotency_key=idem_key).first()
        if existing:
            return jsonify({'invite': {
                'id': existing.id,
                'status': existing.status,
                'type': existing.invite_type,
                'expiresAt': existing.expires_at.isoformat() if existing.expires_at else None,
                'venue': venue,
                'paymentHoldId': existing.payment_hold_id,
            }}), 200

    expires_at = datetime.utcnow() + timedelta(hours=2)
    venue_google_place_id = None
    venue_snapshot_json = None
    if venue and isinstance(venue, dict):
        venue_google_place_id = venue.get('googlePlaceId')
        snapshot = venue.get('snapshot')
        if snapshot is not None:
            venue_snapshot_json = json.dumps(snapshot)

    invite = NearbyInvite(
        inviter_user_id=user.id,
        invitee_user_id=int(invitee_user_id),
        invite_type=invite_type,
        status='pending',
        message_text=message,
        venue_google_place_id=venue_google_place_id,
        venue_snapshot_json=venue_snapshot_json,
        payment_hold_id=None,
        expires_at=expires_at,
        responded_at=None,
        idempotency_key=idem_key,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.session.add(invite)
    db.session.commit()

    return jsonify({'invite': {
        'id': invite.id,
        'status': invite.status,
        'type': invite.invite_type,
        'expiresAt': invite.expires_at.isoformat() if invite.expires_at else None,
        'venue': venue,
        'paymentHoldId': invite.payment_hold_id,
    }}), 201


@app.route('/api/v1/nearby/invites/<string:invite_id>/accept', methods=['POST'])
def api_v1_accept_invite(invite_id):
    user, err = require_auth()
    if err:
        return err
    invite = NearbyInvite.query.get(invite_id)
    if not invite:
        return jsonify({'error': 'not_found'}), 404
    if invite.invitee_user_id != user.id:
        return jsonify({'error': 'forbidden'}), 403

    invite.status = 'accepted'
    invite.responded_at = datetime.utcnow()
    invite.updated_at = datetime.utcnow()

    meeting = Meeting.query.filter_by(invite_id=invite.id).first()
    if not meeting:
        meeting = Meeting(
            invite_id=invite.id,
            match_id=None,
            inviter_user_id=invite.inviter_user_id,
            invitee_user_id=invite.invitee_user_id,
            venue_google_place_id=invite.venue_google_place_id,
            venue_snapshot_json=invite.venue_snapshot_json,
            status='scheduled',
            scheduled_for=None,
            started_at=None,
            ended_at=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.session.add(meeting)

    db.session.commit()

    return jsonify({
        'invite': {'id': invite.id, 'status': invite.status},
        'meeting': {'id': meeting.id, 'status': meeting.status},
    })


@app.route('/api/v1/nearby/invites/<string:invite_id>/decline', methods=['POST'])
def api_v1_decline_invite(invite_id):
    user, err = require_auth()
    if err:
        return err
    invite = NearbyInvite.query.get(invite_id)
    if not invite:
        return jsonify({'error': 'not_found'}), 404
    if invite.invitee_user_id != user.id:
        return jsonify({'error': 'forbidden'}), 403
    invite.status = 'declined'
    invite.responded_at = datetime.utcnow()
    invite.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'invite': {'id': invite.id, 'status': invite.status}})


@app.route('/api/v1/meetings/<string:meeting_id>/start', methods=['POST'])
def api_v1_start_meeting(meeting_id):
    user, err = require_auth()
    if err:
        return err
    meeting = Meeting.query.get(meeting_id)
    if not meeting:
        return jsonify({'error': 'not_found'}), 404
    if user.id not in (meeting.inviter_user_id, meeting.invitee_user_id):
        return jsonify({'error': 'forbidden'}), 403
    meeting.status = 'active'
    meeting.started_at = datetime.utcnow()
    meeting.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'meeting': {'id': meeting.id, 'status': meeting.status}})


@app.route('/api/v1/meetings/<string:meeting_id>/end', methods=['POST'])
def api_v1_end_meeting(meeting_id):
    user, err = require_auth()
    if err:
        return err
    meeting = Meeting.query.get(meeting_id)
    if not meeting:
        return jsonify({'error': 'not_found'}), 404
    if user.id not in (meeting.inviter_user_id, meeting.invitee_user_id):
        return jsonify({'error': 'forbidden'}), 403
    meeting.status = 'ended'
    meeting.ended_at = datetime.utcnow()
    meeting.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'meeting': {'id': meeting.id, 'status': meeting.status}})


# In-memory store for real-time location tracking (in production, use Redis)
_meeting_locations = {}  # {meeting_id: {user_id: {lat, lng, updated_at}}}


@app.route('/api/v1/meetings/<string:meeting_id>/location', methods=['POST'])
def api_v1_update_meeting_location(meeting_id):
    """Update user's location for a meeting (approaching the meeting spot)"""
    user, err = require_auth()
    if err:
        return err
    meeting = Meeting.query.get(meeting_id)
    if not meeting:
        return jsonify({'error': 'not_found'}), 404
    if user.id not in (meeting.inviter_user_id, meeting.invitee_user_id):
        return jsonify({'error': 'forbidden'}), 403
    if meeting.status not in ('scheduled', 'active'):
        return jsonify({'error': 'meeting_not_active'}), 400

    body = request.json or {}
    lat = body.get('lat')
    lng = body.get('lng')
    if lat is None or lng is None:
        return jsonify({'error': 'missing_coordinates'}), 400

    try:
        lat = float(lat)
        lng = float(lng)
    except (TypeError, ValueError):
        return jsonify({'error': 'invalid_coordinates'}), 400

    if meeting_id not in _meeting_locations:
        _meeting_locations[meeting_id] = {}

    _meeting_locations[meeting_id][str(user.id)] = {
        'lat': lat,
        'lng': lng,
        'updatedAt': datetime.utcnow().isoformat(),
    }

    return jsonify({'ok': True})


@app.route('/api/v1/meetings/<string:meeting_id>/location', methods=['GET'])
def api_v1_get_meeting_locations(meeting_id):
    """Get both participants' locations for a meeting"""
    user, err = require_auth()
    if err:
        return err
    meeting = Meeting.query.get(meeting_id)
    if not meeting:
        return jsonify({'error': 'not_found'}), 404
    if user.id not in (meeting.inviter_user_id, meeting.invitee_user_id):
        return jsonify({'error': 'forbidden'}), 403

    # Get meeting spot coordinates
    meeting_spot = None
    if meeting.venue_snapshot_json:
        try:
            snapshot = json.loads(meeting.venue_snapshot_json)
            if snapshot.get('coordinates'):
                meeting_spot = snapshot['coordinates']
        except Exception:
            pass

    locations = _meeting_locations.get(meeting_id, {})
    
    # Determine which user is which
    other_user_id = str(meeting.invitee_user_id if user.id == meeting.inviter_user_id else meeting.inviter_user_id)
    my_location = locations.get(str(user.id))
    other_location = locations.get(other_user_id)

    return jsonify({
        'meetingSpot': meeting_spot,
        'myLocation': my_location,
        'otherLocation': other_location,
        'meetingStatus': meeting.status,
    })


@app.route('/api/v1/meetings/<string:meeting_id>', methods=['GET'])
def api_v1_get_meeting(meeting_id):
    """Get meeting details"""
    user, err = require_auth()
    if err:
        return err
    meeting = Meeting.query.get(meeting_id)
    if not meeting:
        return jsonify({'error': 'not_found'}), 404
    if user.id not in (meeting.inviter_user_id, meeting.invitee_user_id):
        return jsonify({'error': 'forbidden'}), 403

    venue = None
    meeting_spot = None
    if meeting.venue_google_place_id:
        try:
            snapshot = json.loads(meeting.venue_snapshot_json) if meeting.venue_snapshot_json else None
            venue = {
                'googlePlaceId': meeting.venue_google_place_id,
                'snapshot': snapshot,
            }
            if snapshot and snapshot.get('coordinates'):
                meeting_spot = snapshot['coordinates']
        except Exception:
            venue = {'googlePlaceId': meeting.venue_google_place_id, 'snapshot': None}
    elif meeting.venue_snapshot_json:
        try:
            snapshot = json.loads(meeting.venue_snapshot_json)
            if snapshot.get('isMapPicked'):
                venue = {
                    'googlePlaceId': None,
                    'snapshot': snapshot,
                    'isMapPicked': True,
                }
                meeting_spot = snapshot.get('coordinates')
        except Exception:
            pass

    return jsonify({
        'meeting': {
            'id': meeting.id,
            'status': meeting.status,
            'inviterUserId': meeting.inviter_user_id,
            'inviteeUserId': meeting.invitee_user_id,
            'venue': venue,
            'meetingSpot': meeting_spot,
            'scheduledFor': meeting.scheduled_for.isoformat() if meeting.scheduled_for else None,
            'startedAt': meeting.started_at.isoformat() if meeting.started_at else None,
            'endedAt': meeting.ended_at.isoformat() if meeting.ended_at else None,
            'createdAt': meeting.created_at.isoformat() if meeting.created_at else None,
        }
    })


@app.route('/api/v1/meetings/<string:meeting_id>/feedback', methods=['POST'])
def api_v1_meeting_feedback(meeting_id):
    user, err = require_auth()
    if err:
        return err
    meeting = Meeting.query.get(meeting_id)
    if not meeting:
        return jsonify({'error': 'not_found'}), 404
    if user.id not in (meeting.inviter_user_id, meeting.invitee_user_id):
        return jsonify({'error': 'forbidden'}), 403
    body = request.json or {}
    meeting_feel = body.get('meetingFeel')
    venue_rating = body.get('venueRating')

    existing = MeetingFeedback.query.filter_by(meeting_id=meeting_id, user_id=user.id).first()
    if existing:
        return jsonify({'ok': True}), 200

    fb = MeetingFeedback(
        meeting_id=meeting_id,
        user_id=user.id,
        meeting_feel=meeting_feel,
        venue_rating=venue_rating,
        created_at=datetime.utcnow(),
    )
    db.session.add(fb)
    db.session.commit()
    return jsonify({'ok': True}), 201


@app.route('/api/v1/payments/holds', methods=['POST'])
def api_v1_create_hold():
    user, err = require_auth()
    if err:
        return err
    if not _payments_enabled():
        return jsonify({'error': 'PAYMENTS_DISABLED'}), 409
    body = request.json or {}
    try:
        amount_cents = int(body.get('amountCents'))
    except Exception:
        amount_cents = None
    currency = (body.get('currency') or 'ils').strip().lower()
    if not amount_cents or amount_cents <= 0:
        return jsonify({'error': 'invalid_amount'}), 400

    provider = _payments_provider_name()
    if provider not in ('mock', 'test', 'stripe', 'payplus'):
        return jsonify({'error': 'unsupported_provider'}), 503

    # Mock/test only for now
    if provider not in ('mock', 'test'):
        return jsonify({'error': 'provider_not_activated'}), 503

    hold = PaymentHold(
        user_id=user.id,
        provider=provider,
        status='authorized',
        currency=currency,
        amount_cents=amount_cents,
        provider_hold_id=f'{provider}_{uuid.uuid4()}',
        expires_at=datetime.utcnow() + timedelta(minutes=15),
        metadata_json=json.dumps({'mode': 'mock'}),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.session.add(hold)

    le = LedgerEntry(
        user_id=user.id,
        invite_id=None,
        meeting_id=None,
        hold_id=hold.id,
        provider=provider,
        event_type='payment_hold_created',
        amount_cents=amount_cents,
        currency=currency,
        details_json=json.dumps({'mode': 'mock'}),
        created_at=datetime.utcnow(),
    )
    db.session.add(le)
    db.session.commit()

    return jsonify({
        'hold': {
            'id': hold.id,
            'status': hold.status,
            'currency': hold.currency,
            'amountCents': hold.amount_cents,
            'provider': hold.provider,
            'expiresAt': hold.expires_at.isoformat() if hold.expires_at else None,
        }
    }), 201


@app.route('/api/v1/payments/holds/<string:hold_id>/capture', methods=['POST'])
def api_v1_capture_hold(hold_id):
    user, err = require_auth()
    if err:
        return err
    if not _payments_enabled():
        return jsonify({'error': 'PAYMENTS_DISABLED'}), 409
    hold = PaymentHold.query.get(hold_id)
    if not hold:
        return jsonify({'error': 'not_found'}), 404
    if hold.user_id != user.id:
        return jsonify({'error': 'forbidden'}), 403
    if hold.status in ('captured', 'released', 'failed'):
        return jsonify({'hold': {'id': hold.id, 'status': hold.status}}), 200
    if hold.provider not in ('mock', 'test'):
        return jsonify({'error': 'provider_not_activated'}), 503

    hold.status = 'captured'
    hold.captured_at = datetime.utcnow()
    hold.updated_at = datetime.utcnow()

    le = LedgerEntry(
        user_id=user.id,
        invite_id=None,
        meeting_id=None,
        hold_id=hold.id,
        provider=hold.provider,
        event_type='payment_hold_captured',
        amount_cents=hold.amount_cents,
        currency=hold.currency,
        details_json=json.dumps({'mode': 'mock'}),
        created_at=datetime.utcnow(),
    )
    db.session.add(le)
    db.session.commit()
    return jsonify({'hold': {'id': hold.id, 'status': hold.status}}), 200


@app.route('/api/v1/payments/holds/<string:hold_id>/release', methods=['POST'])
def api_v1_release_hold(hold_id):
    user, err = require_auth()
    if err:
        return err
    if not _payments_enabled():
        return jsonify({'error': 'PAYMENTS_DISABLED'}), 409
    hold = PaymentHold.query.get(hold_id)
    if not hold:
        return jsonify({'error': 'not_found'}), 404
    if hold.user_id != user.id:
        return jsonify({'error': 'forbidden'}), 403
    if hold.status in ('released', 'failed'):
        return jsonify({'hold': {'id': hold.id, 'status': hold.status}}), 200
    if hold.provider not in ('mock', 'test'):
        return jsonify({'error': 'provider_not_activated'}), 503

    hold.status = 'released'
    hold.released_at = datetime.utcnow()
    hold.updated_at = datetime.utcnow()

    le = LedgerEntry(
        user_id=user.id,
        invite_id=None,
        meeting_id=None,
        hold_id=hold.id,
        provider=hold.provider,
        event_type='payment_hold_released',
        amount_cents=hold.amount_cents,
        currency=hold.currency,
        details_json=json.dumps({'mode': 'mock'}),
        created_at=datetime.utcnow(),
    )
    db.session.add(le)
    db.session.commit()
    return jsonify({'hold': {'id': hold.id, 'status': hold.status}}), 200


@app.route('/api/v1/payments/stripe/webhook', methods=['POST'])
def api_v1_stripe_webhook():
    if _payments_provider_name() != 'stripe':
        return jsonify({'error': 'provider_not_enabled'}), 404
    if not _payments_enabled():
        return jsonify({'error': 'PAYMENTS_DISABLED'}), 409
    try:
        import stripe
        payload = request.data
        sig_header = request.headers.get('Stripe-Signature')
        webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        if not webhook_secret:
            return jsonify({'error': 'webhook_not_configured'}), 503
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)

        event_id = event.get('id')
        if event_id:
            existing = LedgerEntry.query.filter_by(stripe_event_id=event_id).first()
            if existing:
                return jsonify({'ok': True}), 200

        le = LedgerEntry(
            user_id=None,
            invite_id=None,
            meeting_id=None,
            hold_id=None,
            provider='stripe',
            event_type='stripe_webhook_received',
            amount_cents=None,
            currency=None,
            provider_event_id=event_id,
            stripe_event_id=event_id,
            details_json=json.dumps({'type': event.get('type')}),
            created_at=datetime.utcnow(),
        )
        db.session.add(le)
        db.session.commit()

        return jsonify({'ok': True}), 200
    except Exception:
        return jsonify({'error': 'webhook_error'}), 400

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
        
        # Normalize email (trim + lowercase)
        normalized_email = data['email'].strip().lower()
        
        # Check if user already exists
        if User.query.filter_by(email=normalized_email).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Hash the password
        password = data['password'].encode('utf-8')
        password_hash = bcrypt.hashpw(password, bcrypt.gensalt())
        
        # Determine user role (auto-admin for specific emails)
        user_role = 'admin' if normalized_email in [e.lower() for e in ADMIN_EMAILS] else 'user'
        
        print(f'[Register] Creating user with email={normalized_email}, db={_DB_INFO}')
        
        # Create new user
        new_user = User(
            first_name=data['first_name'].strip(),
            last_name=data['last_name'].strip(),
            email=normalized_email,
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

# ============================================================================
# OTP AUTHENTICATION ENDPOINTS
# These endpoints issue real JWTs for phone-based authentication
# ============================================================================

# In-memory OTP storage (use Redis in production)
_otp_storage = {}

@app.route('/api/auth/check-phone', methods=['POST'])
def check_phone():
    """
    Check if a user exists with the given phone number.
    Body: { phone: string }
    Returns: { exists: bool, user_id: int|null }
    """
    data = request.json or {}
    phone = data.get('phone')
    
    if not phone:
        return jsonify({'error': 'phone_required', 'message': 'Phone number is required'}), 400
    
    # Normalize phone number
    normalized_phone = phone.strip()
    if not normalized_phone.startswith('+'):
        normalized_phone = '+' + normalized_phone
    
    user = User.query.filter_by(phone_number=normalized_phone).first()
    
    return jsonify({
        'exists': user is not None,
        'user_id': user.id if user else None,
    }), 200

@app.route('/api/auth/otp/request', methods=['POST'])
def request_otp():
    """
    Request OTP for phone authentication.
    Body: { phoneE164: string }
    Returns: { verificationId: string, expiresInSec: int, resendInSec: int }
    """
    data = request.json or {}
    phone = data.get('phoneE164')
    
    if not phone or not phone.startswith('+'):
        return jsonify({'error': 'invalid_phone', 'message': 'Invalid phone number'}), 400
    
    # Generate OTP and verification ID
    import random
    otp = str(random.randint(100000, 999999))
    verification_id = f"verify_{uuid.uuid4().hex[:16]}"
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    _otp_storage[verification_id] = {
        'phone': phone,
        'otp': otp,
        'expires_at': expires_at,
        'attempts': 0,
    }
    
    # In production, send SMS here
    print(f'[OTP] Code for {phone}: {otp}')
    
    # Include OTP in response for testing (remove in production with real SMS)
    return jsonify({
        'verificationId': verification_id,
        'expiresInSec': 300,
        'resendInSec': 30,
        'debugCode': otp,  # TODO: Remove when SMS is implemented
    }), 200

@app.route('/api/auth/otp/verify', methods=['POST'])
def verify_otp():
    """
    Verify OTP and return JWT tokens.
    Body: { verificationId: string, code: string }
    Returns: { accessToken: string, refreshToken: string, user: object }
    """
    data = request.json or {}
    verification_id = data.get('verificationId')
    code = data.get('code')
    
    if not verification_id or not code:
        return jsonify({'error': 'missing_fields', 'message': 'verificationId and code required'}), 400
    
    record = _otp_storage.get(verification_id)
    if not record:
        return jsonify({'error': 'expired_code', 'message': 'Verification code expired'}), 400
    
    # Check expiration
    if datetime.utcnow() > record['expires_at']:
        del _otp_storage[verification_id]
        return jsonify({'error': 'expired_code', 'message': 'Verification code expired'}), 400
    
    # Check attempts
    record['attempts'] += 1
    if record['attempts'] > 5:
        del _otp_storage[verification_id]
        return jsonify({'error': 'too_many_attempts', 'message': 'Too many attempts'}), 400
    
    # Verify code
    if record['otp'] != code:
        return jsonify({'error': 'wrong_code', 'message': 'Incorrect code'}), 400
    
    # Success - clean up
    phone = record['phone']
    del _otp_storage[verification_id]
    
    # Find or create user by phone
    user = User.query.filter_by(phone_number=phone).first()
    is_new_user = False
    
    if not user:
        # Create new user with phone
        is_new_user = True
        user = User(
            first_name='',
            last_name='',
            email=f'{phone.replace("+", "")}@phone.pulse.app',  # Placeholder email
            phone_number=phone,
            role='user',
        )
        db.session.add(user)
        db.session.commit()
        print(f'[OTP] Created new user id={user.id} for phone={phone}')
    else:
        print(f'[OTP] Found existing user id={user.id} for phone={phone}')
    
    # Generate real JWT tokens
    secret_prefix = app.config['SECRET_KEY'][:8] if len(app.config['SECRET_KEY']) >= 8 else 'SHORT'
    print(f'[OTP] Generating JWT with SECRET_KEY prefix: {secret_prefix}...')
    access_token = jwt.encode(
        {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=7),
        },
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    
    refresh_token = jwt.encode(
        {
            'user_id': user.id,
            'type': 'refresh',
            'exp': datetime.utcnow() + timedelta(days=30),
        },
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    
    return jsonify({
        'accessToken': access_token,
        'refreshToken': refresh_token,
        'user': {
            'id': user.id,
            'phoneE164': user.phone_number,
            'firstName': user.first_name,
            'email': user.email,
            'onboardingStatus': 'COMPLETED' if user.first_name else 'NOT_STARTED',
            'hasPassword': user.password_hash is not None,
        },
    }), 200

@app.route('/api/auth/set-password', methods=['POST'])
def set_password():
    """
    Set password for authenticated user (during signup flow).
    Body: { password: string }
    Requires: Bearer token
    """
    user = get_current_user()
    if not user:
        return jsonify({'error': 'unauthorized', 'message': 'Authentication required'}), 401
    
    data = request.json or {}
    password = data.get('password', '')
    
    if not password:
        return jsonify({'error': 'validation_error', 'message': 'Password is required'}), 400
    
    if len(password) < 8:
        return jsonify({'error': 'weak_password', 'message': 'Password must be at least 8 characters'}), 400
    
    # Check password strength
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password)
    
    strength_score = sum([has_upper, has_lower, has_digit, has_special])
    
    if strength_score < 2:
        return jsonify({
            'error': 'weak_password',
            'message': 'Password must contain at least 2 of: uppercase, lowercase, number, special character'
        }), 400
    
    # Hash and save password
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user.password_hash = password_hash
    db.session.commit()
    
    print(f'[Auth] Password set for user_id={user.id}')
    
    return jsonify({
        'success': True,
        'message': 'Password set successfully',
        'strengthScore': strength_score,
    }), 200

@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    """
    Login with username/email and password.
    Body: { usernameOrEmail: string, password: string }
    Returns: { accessToken: string, refreshToken: string, user: object } or { requiresOtp: true, ... }
    """
    data = request.json or {}
    username_or_email = data.get('usernameOrEmail', '').lower().strip()
    password = data.get('password', '')
    
    # Enhanced login logging for debugging
    print(f'[Login] Attempt: email={username_or_email}, db={_DB_INFO}')
    
    if not username_or_email or not password:
        print(f'[Login] Failed: missing credentials')
        return jsonify({'error': 'validation_error', 'message': 'Username and password required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=username_or_email).first()
    
    # Log user lookup result
    total_users = User.query.count()
    print(f'[Login] User lookup: found={user is not None}, total_users_in_db={total_users}')
    
    if not user:
        print(f'[Login] Failed: no user found for email={username_or_email}')
        return jsonify({'error': 'user_not_found', 'message': 'No account found'}), 404
    
    # Check password
    if not user.password_hash:
        return jsonify({'error': 'invalid_credentials', 'message': 'Invalid credentials'}), 401
    
    try:
        if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash):
            return jsonify({'error': 'invalid_credentials', 'message': 'Invalid credentials'}), 401
    except Exception as e:
        print(f'[Auth] Password check error: {e}')
        return jsonify({'error': 'invalid_credentials', 'message': 'Invalid credentials'}), 401
    
    # Generate real JWT tokens
    access_token = jwt.encode(
        {
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=7),
        },
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    
    refresh_token = jwt.encode(
        {
            'user_id': user.id,
            'type': 'refresh',
            'exp': datetime.utcnow() + timedelta(days=30),
        },
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    
    print(f'[Auth] Login success for user_id={user.id}')
    
    return jsonify({
        'requiresOtp': False,
        'accessToken': access_token,
        'refreshToken': refresh_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'phoneE164': user.phone_number,
            'firstName': user.first_name,
            'onboardingStatus': 'COMPLETED' if user.first_name else 'NOT_STARTED',
        },
    }), 200

# ============================================================================
# SPOTIFY OAUTH ENDPOINTS
# Authorization Code Flow for connecting user's Spotify account
# ============================================================================

# Spotify OAuth config
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
SPOTIFY_REDIRECT_URI = os.getenv('SPOTIFY_REDIRECT_URI', 'https://pulse-dating-backend.onrender.com/callback')
SPOTIFY_SCOPES = 'user-top-read user-read-email user-read-private'

# In-memory state storage for CSRF protection (use Redis in production)
_spotify_oauth_states = {}

@app.route('/auth/spotify', methods=['GET'])
def spotify_auth():
    """
    Initiate Spotify OAuth flow.
    Redirects user to Spotify authorization page.
    Requires: user_id query param or Bearer token to identify the user.
    """
    # Get user_id from query param or token
    user_id = request.args.get('user_id')
    return_to = request.args.get('return_to', '/settings')  # Default to settings, can be /auth/social-connect
    
    if not user_id:
        user = get_current_user()
        if user:
            user_id = str(user.id)
    
    if not user_id:
        return jsonify({'error': 'unauthorized', 'message': 'User ID required'}), 401
    
    if not SPOTIFY_CLIENT_ID:
        return jsonify({'error': 'config_error', 'message': 'Spotify not configured'}), 500
    
    # Generate random state for CSRF protection
    state = f"{user_id}:{uuid.uuid4().hex}"
    _spotify_oauth_states[state] = {
        'user_id': int(user_id),
        'created_at': datetime.utcnow(),
        'return_to': return_to,
    }
    
    # Clean up old states (older than 10 minutes)
    cutoff = datetime.utcnow() - timedelta(minutes=10)
    expired_states = [s for s, data in _spotify_oauth_states.items() if data['created_at'] < cutoff]
    for s in expired_states:
        del _spotify_oauth_states[s]
    
    # Build Spotify authorization URL
    import urllib.parse
    params = {
        'client_id': SPOTIFY_CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': SPOTIFY_REDIRECT_URI,
        'scope': SPOTIFY_SCOPES,
        'state': state,
        'show_dialog': 'true',  # Always show dialog for re-auth
    }
    auth_url = f"https://accounts.spotify.com/authorize?{urllib.parse.urlencode(params)}"
    
    print(f'[Spotify] Redirecting user_id={user_id} to Spotify auth')
    
    # Redirect to Spotify
    from flask import redirect
    return redirect(auth_url)

@app.route('/callback', methods=['GET'])
def spotify_callback():
    """
    Spotify OAuth callback.
    Exchanges authorization code for access/refresh tokens.
    """
    from flask import redirect
    import base64
    
    code = request.args.get('code')
    state = request.args.get('state')
    error = request.args.get('error')
    
    # Frontend URL for redirects
    frontend_url = os.getenv('FRONTEND_URL', 'https://pulse-dating-app-1.onrender.com')
    
    # Handle error from Spotify
    if error:
        print(f'[Spotify] Auth error: {error}')
        return redirect(f'{frontend_url}/settings?spotify=error&reason={error}')
    
    if not code or not state:
        print('[Spotify] Missing code or state')
        return redirect(f'{frontend_url}/settings?spotify=error&reason=missing_params')
    
    # Validate state (CSRF protection)
    state_data = _spotify_oauth_states.get(state)
    if not state_data:
        print(f'[Spotify] Invalid or expired state: {state}')
        return redirect(f'{frontend_url}/settings?spotify=error&reason=invalid_state')
    
    user_id = state_data['user_id']
    return_to = state_data.get('return_to', '/settings')
    del _spotify_oauth_states[state]  # Clear used state
    
    # Exchange code for tokens
    try:
        # Prepare token request
        auth_header = base64.b64encode(f'{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}'.encode()).decode()
        
        token_response = requests.post(
            'https://accounts.spotify.com/api/token',
            headers={
                'Authorization': f'Basic {auth_header}',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data={
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': SPOTIFY_REDIRECT_URI,
            },
            timeout=10,
        )
        
        if token_response.status_code != 200:
            print(f'[Spotify] Token exchange failed: {token_response.status_code} {token_response.text}')
            return redirect(f'{frontend_url}/settings?spotify=error&reason=token_exchange_failed')
        
        token_data = token_response.json()
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token')
        expires_in = token_data.get('expires_in', 3600)
        
        if not access_token:
            print('[Spotify] No access token in response')
            return redirect(f'{frontend_url}/settings?spotify=error&reason=no_token')
        
        # Store tokens for user
        user = User.query.get(user_id)
        if not user:
            print(f'[Spotify] User not found: {user_id}')
            return redirect(f'{frontend_url}/settings?spotify=error&reason=user_not_found')
        
        user.spotify_access_token = access_token
        user.spotify_refresh_token = refresh_token
        user.spotify_token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        db.session.commit()
        
        print(f'[Spotify] Tokens stored for user_id={user_id}')
        
        # Generate new JWT token to restore session after redirect
        pulse_token = jwt.encode(
            {
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(days=7),
            },
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        
        # Redirect with token in URL fragment (not query string for security)
        # Frontend will extract token from hash and restore session
        return redirect(f'{frontend_url}{return_to}?spotify=connected#token={pulse_token}')
        
    except requests.RequestException as e:
        print(f'[Spotify] Request error: {e}')
        return redirect(f'{frontend_url}/settings?spotify=error&reason=network_error')
    except Exception as e:
        print(f'[Spotify] Unexpected error: {e}')
        return redirect(f'{frontend_url}/settings?spotify=error&reason=server_error')

def refresh_spotify_token(user):
    """
    Refresh Spotify access token using refresh token.
    Returns True if successful, False otherwise.
    """
    import base64
    
    if not user.spotify_refresh_token:
        return False
    
    try:
        auth_header = base64.b64encode(f'{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}'.encode()).decode()
        
        response = requests.post(
            'https://accounts.spotify.com/api/token',
            headers={
                'Authorization': f'Basic {auth_header}',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data={
                'grant_type': 'refresh_token',
                'refresh_token': user.spotify_refresh_token,
            },
            timeout=10,
        )
        
        if response.status_code != 200:
            print(f'[Spotify] Token refresh failed: {response.status_code}')
            return False
        
        token_data = response.json()
        user.spotify_access_token = token_data.get('access_token')
        # Spotify may return a new refresh token
        if token_data.get('refresh_token'):
            user.spotify_refresh_token = token_data.get('refresh_token')
        user.spotify_token_expires_at = datetime.utcnow() + timedelta(seconds=token_data.get('expires_in', 3600))
        db.session.commit()
        
        print(f'[Spotify] Token refreshed for user_id={user.id}')
        return True
        
    except Exception as e:
        print(f'[Spotify] Token refresh error: {e}')
        return False

@app.route('/api/spotify/status', methods=['GET'])
def spotify_status():
    """
    Check if current user has Spotify connected.
    """
    user = get_current_user()
    if not user:
        return jsonify({'error': 'unauthorized'}), 401
    
    connected = bool(user.spotify_access_token and user.spotify_refresh_token)
    
    return jsonify({
        'connected': connected,
        'expiresAt': user.spotify_token_expires_at.isoformat() if user.spotify_token_expires_at else None,
    }), 200

@app.route('/api/spotify/disconnect', methods=['POST'])
def spotify_disconnect():
    """
    Disconnect Spotify from user account.
    """
    user = get_current_user()
    if not user:
        return jsonify({'error': 'unauthorized'}), 401
    
    user.spotify_access_token = None
    user.spotify_refresh_token = None
    user.spotify_token_expires_at = None
    db.session.commit()
    
    print(f'[Spotify] Disconnected for user_id={user.id}')
    
    return jsonify({'success': True, 'message': 'Spotify disconnected'}), 200

@app.route('/api/spotify/top-artists', methods=['GET'])
def spotify_top_artists():
    """
    Get user's top artists from Spotify.
    Requires user to have connected Spotify account.
    """
    user = get_current_user()
    if not user:
        return jsonify({'error': 'unauthorized'}), 401
    
    if not user.spotify_access_token:
        return jsonify({'error': 'spotify_not_connected', 'message': 'Please connect your Spotify account'}), 400
    
    # Check if token is expired and refresh if needed
    if user.spotify_token_expires_at and user.spotify_token_expires_at < datetime.utcnow():
        if not refresh_spotify_token(user):
            return jsonify({'error': 'token_refresh_failed', 'message': 'Please reconnect your Spotify account'}), 401
    
    # Call Spotify API
    try:
        limit = request.args.get('limit', 10, type=int)
        time_range = request.args.get('time_range', 'medium_term')  # short_term, medium_term, long_term
        
        print(f'[Spotify] Calling top-artists for user_id={user.id}, token_expires_at={user.spotify_token_expires_at}')
        
        response = requests.get(
            f'https://api.spotify.com/v1/me/top/artists',
            headers={
                'Authorization': f'Bearer {user.spotify_access_token}',
            },
            params={
                'limit': min(limit, 50),
                'time_range': time_range,
            },
            timeout=10,
        )
        
        print(f'[Spotify] API response status: {response.status_code}')
        
        # If 401 or 403, try refreshing token once
        if response.status_code in [401, 403]:
            print(f'[Spotify] Got {response.status_code}, response body: {response.text[:200]}')
            if refresh_spotify_token(user):
                response = requests.get(
                    f'https://api.spotify.com/v1/me/top/artists',
                    headers={
                        'Authorization': f'Bearer {user.spotify_access_token}',
                    },
                    params={
                        'limit': min(limit, 50),
                        'time_range': time_range,
                    },
                    timeout=10,
                )
            else:
                return jsonify({'error': 'token_refresh_failed', 'message': 'Please reconnect your Spotify account'}), 401
        
        if response.status_code != 200:
            print(f'[Spotify] API error: {response.status_code} {response.text}')
            return jsonify({'error': 'spotify_api_error', 'message': 'Failed to fetch top artists'}), response.status_code
        
        data = response.json()
        
        # Format response
        artists = []
        for item in data.get('items', []):
            # Get the best image (prefer medium size ~300px)
            images = item.get('images', [])
            image_url = None
            if images:
                # Spotify returns images sorted by size (largest first)
                # Try to get medium-sized image, fallback to first available
                for img in images:
                    if img.get('width', 0) <= 320:
                        image_url = img.get('url')
                        break
                if not image_url and images:
                    image_url = images[0].get('url')
            
            artists.append({
                'id': item.get('id'),
                'name': item.get('name'),
                'genres': item.get('genres', []),
                'popularity': item.get('popularity'),
                'imageUrl': image_url,
                'spotifyUrl': item.get('external_urls', {}).get('spotify'),
            })
        
        print(f'[Spotify] Returning {len(artists)} artists for user_id={user.id}')
        
        return jsonify({
            'artists': artists,
            'total': data.get('total', len(artists)),
            'timeRange': time_range,
        }), 200
        
    except requests.RequestException as e:
        print(f'[Spotify] Request error: {e}')
        return jsonify({'error': 'network_error', 'message': 'Failed to connect to Spotify'}), 503
    except Exception as e:
        print(f'[Spotify] Unexpected error: {e}')
        return jsonify({'error': 'server_error', 'message': 'Something went wrong'}), 500

@app.route('/api/spotify/top-tracks', methods=['GET'])
def spotify_top_tracks():
    """
    Get user's top tracks from Spotify.
    Requires user to have connected Spotify account.
    """
    user = get_current_user()
    if not user:
        return jsonify({'error': 'unauthorized'}), 401
    
    if not user.spotify_access_token:
        return jsonify({'error': 'spotify_not_connected', 'message': 'Please connect your Spotify account'}), 400
    
    # Check if token is expired and refresh if needed
    if user.spotify_token_expires_at and user.spotify_token_expires_at < datetime.utcnow():
        if not refresh_spotify_token(user):
            return jsonify({'error': 'token_refresh_failed', 'message': 'Please reconnect your Spotify account'}), 401
    
    # Call Spotify API
    try:
        limit = request.args.get('limit', 10, type=int)
        time_range = request.args.get('time_range', 'medium_term')
        
        response = requests.get(
            f'https://api.spotify.com/v1/me/top/tracks',
            headers={
                'Authorization': f'Bearer {user.spotify_access_token}',
            },
            params={
                'limit': min(limit, 50),
                'time_range': time_range,
            },
            timeout=10,
        )
        
        # If 401, try refreshing token once
        if response.status_code == 401:
            if refresh_spotify_token(user):
                response = requests.get(
                    f'https://api.spotify.com/v1/me/top/tracks',
                    headers={
                        'Authorization': f'Bearer {user.spotify_access_token}',
                    },
                    params={
                        'limit': min(limit, 50),
                        'time_range': time_range,
                    },
                    timeout=10,
                )
            else:
                return jsonify({'error': 'token_refresh_failed', 'message': 'Please reconnect your Spotify account'}), 401
        
        if response.status_code != 200:
            print(f'[Spotify] API error: {response.status_code} {response.text}')
            return jsonify({'error': 'spotify_api_error', 'message': 'Failed to fetch top tracks'}), response.status_code
        
        data = response.json()
        
        # Format response
        tracks = []
        for item in data.get('items', []):
            tracks.append({
                'id': item.get('id'),
                'name': item.get('name'),
                'artists': [{'id': a.get('id'), 'name': a.get('name')} for a in item.get('artists', [])],
                'album': {
                    'id': item.get('album', {}).get('id'),
                    'name': item.get('album', {}).get('name'),
                    'imageUrl': item.get('album', {}).get('images', [{}])[0].get('url') if item.get('album', {}).get('images') else None,
                },
                'durationMs': item.get('duration_ms'),
                'popularity': item.get('popularity'),
                'previewUrl': item.get('preview_url'),
                'spotifyUrl': item.get('external_urls', {}).get('spotify'),
            })
        
        return jsonify({
            'tracks': tracks,
            'total': data.get('total', len(tracks)),
            'timeRange': time_range,
        }), 200
        
    except requests.RequestException as e:
        print(f'[Spotify] Request error: {e}')
        return jsonify({'error': 'network_error', 'message': 'Failed to connect to Spotify'}), 503
    except Exception as e:
        print(f'[Spotify] Unexpected error: {e}')
        return jsonify({'error': 'server_error', 'message': 'Something went wrong'}), 500

# ============================================================================
# END SPOTIFY OAUTH ENDPOINTS
# ============================================================================

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
    
    Now uses real GPS coordinates for distance calculation when available.
    """
    try:
        # Get query params
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        user_id = request.args.get('user_id', type=int)  # Current user for exclusion
        radius_km = request.args.get('radius', DEFAULT_RADIUS_KM, type=float)
        
        # Get current user's gender preference (show_me) and location
        current_user = None
        show_me_preference = 'Everyone'
        current_lat = None
        current_lng = None
        if user_id:
            current_user = User.query.get(user_id)
            if current_user:
                if current_user.show_me:
                    show_me_preference = current_user.show_me
                current_lat = current_user.latitude
                current_lng = current_user.longitude
        
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
                'distanceMeters': _calc_distance_meters(current_lat, current_lng, user.latitude, user.longitude),
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

@app.route('/api/dev/seed-nearby-users', methods=['POST'])
def seed_nearby_users():
    """
    DEV ONLY: Create test users near the requesting user's location.
    Guarded by ALLOW_DEV_SEED env flag.
    
    Body: { latitude: float, longitude: float } (optional - uses default Tel Aviv if not provided)
    Creates 5 users at varying distances (0.5km, 1km, 2km, 5km, 15km)
    """
    # Guard: only allow in development or when explicitly enabled
    allow_seed = os.getenv('ALLOW_DEV_SEED', 'false').lower() == 'true'
    env = os.getenv('FLASK_ENV', os.getenv('ENV', 'production'))
    
    if env == 'production' and not allow_seed:
        return jsonify({
            'error': 'forbidden',
            'message': 'Dev seed endpoint disabled in production. Set ALLOW_DEV_SEED=true to enable.'
        }), 403
    
    data = request.json or {}
    base_lat = data.get('latitude', 32.0853)  # Default: Tel Aviv
    base_lng = data.get('longitude', 34.7818)
    
    # Define test users at different distances
    # Each tuple: (name, gender, lat_offset, lng_offset, approx_distance_km)
    test_users = [
        ('Test User A', 'Woman', 0.0045, 0.0045, 0.5),   # ~0.5km
        ('Test User B', 'Man', 0.009, 0.009, 1.0),       # ~1km
        ('Test User C', 'Woman', 0.018, 0.018, 2.0),    # ~2km
        ('Test User D', 'Man', 0.045, 0.045, 5.0),      # ~5km
        ('Test User E', 'Woman', 0.135, 0.135, 15.0),   # ~15km
    ]
    
    created_users = []
    
    for i, (name, gender, lat_off, lng_off, approx_dist) in enumerate(test_users):
        # Check if test user already exists
        email = f'test_nearby_{i+1}@pulse.dev'
        existing = User.query.filter_by(email=email).first()
        
        if existing:
            # Update existing user
            existing.latitude = base_lat + lat_off
            existing.longitude = base_lng + lng_off
            existing.is_active = True
            existing.last_active = datetime.utcnow() - timedelta(minutes=i * 5)  # Stagger last_active
            existing.gender = gender
            db.session.commit()
            
            # Calculate actual distance
            actual_dist = geodesic(
                (base_lat, base_lng),
                (existing.latitude, existing.longitude)
            ).kilometers
            
            created_users.append({
                'id': existing.id,
                'name': name,
                'email': email,
                'latitude': existing.latitude,
                'longitude': existing.longitude,
                'approxDistanceKm': approx_dist,
                'actualDistanceKm': round(actual_dist, 2),
                'lastActive': existing.last_active.isoformat(),
                'status': 'updated'
            })
        else:
            # Create new user
            new_user = User(
                first_name=name.split()[0],
                last_name=name.split()[1] if len(name.split()) > 1 else 'Test',
                email=email,
                gender=gender,
                latitude=base_lat + lat_off,
                longitude=base_lng + lng_off,
                is_active=True,
                last_active=datetime.utcnow() - timedelta(minutes=i * 5),
                residence='Tel Aviv',
                looking_for='Relationship',
                interests='Coffee, Music, Travel',
                hobbies='Testing the Pulse app',
            )
            db.session.add(new_user)
            db.session.commit()
            
            # Calculate actual distance
            actual_dist = geodesic(
                (base_lat, base_lng),
                (new_user.latitude, new_user.longitude)
            ).kilometers
            
            created_users.append({
                'id': new_user.id,
                'name': name,
                'email': email,
                'latitude': new_user.latitude,
                'longitude': new_user.longitude,
                'approxDistanceKm': approx_dist,
                'actualDistanceKm': round(actual_dist, 2),
                'lastActive': new_user.last_active.isoformat(),
                'status': 'created'
            })
    
    return jsonify({
        'success': True,
        'message': f'Created/updated {len(created_users)} test users',
        'baseLocation': {'latitude': base_lat, 'longitude': base_lng},
        'users': created_users
    }), 200


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
        try:
            existing_picks = TodaysPicks.query.filter(
                TodaysPicks.user_id == user_id,
                TodaysPicks.pick_date == today,
                TodaysPicks.dismissed == False
            ).all() if user_id else []
        except Exception as db_err:
            # Table might not exist yet - fall back to generating from users
            print(f'[TodaysPicks] DB query failed (table may not exist): {db_err}')
            existing_picks = []
        
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
        save_to_db = True  # Flag to track if we should save picks to DB
        for candidate, score, context in top_picks:
            # Create pick record (skip if table doesn't exist)
            if user_id and save_to_db:
                try:
                    pick_record = TodaysPicks(
                        user_id=user_id,
                        pick_user_id=candidate.id,
                        pick_date=today,
                        meeting_likelihood=score,
                        meeting_context=context,
                    )
                    db.session.add(pick_record)
                except Exception as db_err:
                    print(f'[TodaysPicks] Cannot save pick to DB: {db_err}')
                    save_to_db = False  # Don't try again for remaining picks
            
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
        
        if user_id and save_to_db:
            try:
                db.session.commit()
            except Exception as commit_err:
                print(f'[TodaysPicks] Commit failed (table may not exist): {commit_err}')
                db.session.rollback()
        
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
            # No user_id - just acknowledge (demo mode)
            return jsonify({'success': True, 'dismissed': True, 'demo': True}), 200
        
        try:
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
                # Pick not found in DB - still acknowledge (may not have been saved)
                return jsonify({'success': True, 'dismissed': True, 'notInDb': True}), 200
        except Exception as db_err:
            # Table might not exist - just acknowledge
            print(f'[TodaysPicks] Dismiss DB error (table may not exist): {db_err}')
            return jsonify({'success': True, 'dismissed': True, 'dbSkipped': True}), 200
            
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
def update_location_legacy():
    """Legacy endpoint - kept for backward compatibility with Dashboard.js"""
    data = request.json
    user = User.query.get(data['user_id'])
    
    if user:
        user.latitude = data['latitude']
        user.longitude = data['longitude']
        user.is_active = data.get('is_active', True)
        user.last_active = datetime.utcnow()
        db.session.commit()
        
        # Emit location update to nearby users
        try:
            emit('user_location_update', {
                'user_id': user.id,
                'latitude': user.latitude,
                'longitude': user.longitude,
                'is_active': user.is_active
            }, broadcast=True)
        except Exception:
            pass  # emit may fail outside socket context
        
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


# ============================================================================
# DEBUG ENDPOINTS - For diagnosing environment and DB issues
# ============================================================================

@app.route('/api/debug/env', methods=['GET'])
def debug_env():
    """
    Safe diagnostic endpoint - returns environment info without secrets.
    """
    origin = request.headers.get('Origin', 'none')
    return jsonify({
        'env': 'production' if os.getenv('RENDER') else 'local',
        'service': os.getenv('RENDER_SERVICE_NAME', 'unknown'),
        'db_type': _DB_INFO.get('db_type', 'unknown'),
        'db_host': _DB_INFO.get('db_host', 'n/a'),
        'db_name': _DB_INFO.get('db_name', 'n/a'),
        'frontend_origin_allowed': origin in FRONTEND_ORIGINS,
        'request_origin': origin,
        'total_users': User.query.count(),
    }), 200

@app.route('/api/debug/user-exists', methods=['GET'])
def debug_user_exists():
    """
    Check if a user exists by email (for debugging).
    """
    email = request.args.get('email', '').lower().strip()
    if not email:
        return jsonify({'error': 'email parameter required'}), 400
    
    user = User.query.filter_by(email=email).first()
    return jsonify({
        'email': email,
        'exists': user is not None,
        'user_id': user.id if user else None,
        'created_at': user.created_at.isoformat() if user and user.created_at else None,
        'db_info': _DB_INFO,
    }), 200

# ============================================================================
# WEEKLY RHYTHM API ENDPOINTS
# ============================================================================

@app.route('/api/users/<int:user_id>/rhythm', methods=['GET'])
def get_user_rhythm(user_id):
    """Get user's weekly rhythm data."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Parse rhythm JSON or return default
    if user.user_rhythm:
        try:
            rhythm = json.loads(user.user_rhythm)
        except:
            rhythm = {'visibility': 'matches', 'recurring': [], 'upcoming': []}
    else:
        rhythm = {'visibility': 'matches', 'recurring': [], 'upcoming': []}
    
    return jsonify({'userRhythm': rhythm}), 200


@app.route('/api/users/me/rhythm', methods=['PUT'])
def update_my_rhythm():
    """Update current user's weekly rhythm."""
    # Get user from auth header or request
    auth_header = request.headers.get('Authorization', '')
    user_id = None
    
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload.get('user_id')
        except:
            pass
    
    # Fallback to request body
    if not user_id:
        user_id = request.json.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.json
    
    # Validate rhythm data
    rhythm = {
        'visibility': data.get('visibility', 'matches'),
        'recurring': data.get('recurring', []),
        'upcoming': data.get('upcoming', []),
    }
    
    # Validate visibility
    if rhythm['visibility'] not in ['hidden', 'matches', 'everyone']:
        rhythm['visibility'] = 'matches'
    
    # Limit recurring to 5 items
    rhythm['recurring'] = rhythm['recurring'][:5]
    
    # Validate recurring items
    for item in rhythm['recurring']:
        if 'label' not in item or len(item.get('label', '')) > 40:
            return jsonify({'error': 'Invalid recurring item'}), 400
    
    # Save to database
    user.user_rhythm = json.dumps(rhythm)
    db.session.commit()
    
    return jsonify({'message': 'Rhythm updated', 'userRhythm': rhythm}), 200


# ============================================================================
# SOS TRUST SCORE + REWARDS API ENDPOINTS
# ============================================================================

# Trust Score Calculation Constants
SOS_TRUST_WEIGHTS = {
    'success_rate': 0.5,
    'completion_rate': 0.2,
    'response_speed': 0.2,
    'consistency': 0.1,
}

SOS_REWARD_CONFIG = {
    'base_reward': 150,
    'bonus_first_help': 25,
    'bonus_long_distance': 20,  # > 500m
    'bonus_fast_arrival': 15,   # < 5 min
    'bonus_trusted_helper': 10,
    'max_rewards_per_day': 5,
    'trusted_helper_threshold': 75,
}


def calculate_trust_score(user):
    """
    Calculate trust score using weighted formula:
    trust_score = (success_rate * 0.5) + (completion_rate * 0.2) + (response_speed * 0.2) + (consistency * 0.1)
    """
    if user.total_helps < 3:
        return 50.0  # Base score for new users
    
    # Success Rate: confirmed_helps / total_helps (0-100)
    success_rate = (user.confirmed_helps / user.total_helps * 100) if user.total_helps > 0 else 50
    
    # Completion Rate: (total_helps - abandonment) / total_helps (0-100)
    total_accepted = user.total_helps + user.abandonment_count
    completion_rate = (user.total_helps / total_accepted * 100) if total_accepted > 0 else 50
    
    # Response Speed Score (0-100) based on avg arrival time
    avg_time_minutes = user.avg_arrival_time / 60 if user.avg_arrival_time else 15
    if avg_time_minutes <= 5:
        speed_score = 100
    elif avg_time_minutes <= 10:
        speed_score = 80
    elif avg_time_minutes <= 15:
        speed_score = 60
    elif avg_time_minutes <= 20:
        speed_score = 40
    else:
        speed_score = 20
    
    # Consistency Score - simplified (based on total helps)
    if user.total_helps >= 20:
        consistency_score = 100
    elif user.total_helps >= 10:
        consistency_score = 80
    elif user.total_helps >= 5:
        consistency_score = 60
    else:
        consistency_score = 40
    
    # Apply weighted formula
    score = (
        success_rate * SOS_TRUST_WEIGHTS['success_rate'] +
        completion_rate * SOS_TRUST_WEIGHTS['completion_rate'] +
        speed_score * SOS_TRUST_WEIGHTS['response_speed'] +
        consistency_score * SOS_TRUST_WEIGHTS['consistency']
    )
    
    return max(0, min(100, score))


def audit_log(event_type, data):
    """
    Structured audit logging for SOS events.
    In production, this would write to a dedicated audit log table or external service.
    """
    log_entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'event_type': event_type,
        'data': data,
    }
    
    # Structured log output (JSON format for log aggregation)
    print(f'[AUDIT] {json.dumps(log_entry)}')
    
    # In production, also write to:
    # - Dedicated audit_logs table
    # - External logging service (e.g., CloudWatch, Datadog)
    # - Event stream for real-time monitoring


def get_helper_daily_rewards(helper_id):
    """Get count of rewards helper received today"""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return SOSReward.query.filter(
        SOSReward.helper_id == helper_id,
        SOSReward.created_at >= today_start
    ).count()


def check_pair_interaction(helper_id, requester_id):
    """Check and get pair interaction for anti-abuse"""
    interaction = HelperInteraction.query.filter_by(
        helper_id=helper_id,
        requester_id=requester_id
    ).first()
    
    if not interaction:
        return None, 0
    
    # Reset weekly count if new week
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    if interaction.week_start != week_start:
        interaction.weekly_count = 0
        interaction.week_start = week_start
        db.session.commit()
    
    return interaction, interaction.weekly_count


@app.route('/api/v1/sos/start', methods=['POST'])
def api_v1_sos_start():
    """Start a new SOS request"""
    user, err = require_auth()
    if err:
        return err
    
    data = request.json or {}
    
    # Check if user already has an active SOS
    active_sos = SOSRequest.query.filter(
        SOSRequest.requester_id == user.id,
        SOSRequest.status.in_(['searching', 'assigned', 'approaching', 'arrived', 'awaiting_confirmation'])
    ).first()
    
    if active_sos:
        return jsonify({'error': 'active_sos_exists', 'sos_id': active_sos.id}), 400
    
    # Check daily request limit (anti-abuse)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_requests = SOSRequest.query.filter(
        SOSRequest.requester_id == user.id,
        SOSRequest.created_at >= today_start
    ).count()
    
    if today_requests >= 3:
        return jsonify({'error': 'daily_limit_reached', 'message': 'Maximum 3 SOS requests per day'}), 429
    
    # Create SOS request
    sos = SOSRequest(
        requester_id=user.id,
        status='searching',
        requester_lat=data.get('lat'),
        requester_lng=data.get('lng'),
    )
    
    # Update user stats
    user.total_sos_requests = (user.total_sos_requests or 0) + 1
    
    db.session.add(sos)
    db.session.commit()
    
    print(f'[SOS] Request {sos.id} started by user {user.id}')
    
    return jsonify({'sos': sos.to_dict()}), 201


@app.route('/api/v1/sos/<string:sos_id>/accept', methods=['POST'])
def api_v1_sos_accept(sos_id):
    """Helper accepts an SOS request"""
    user, err = require_auth()
    if err:
        return err
    
    data = request.json or {}
    
    sos = SOSRequest.query.get(sos_id)
    if not sos:
        return jsonify({'error': 'not_found'}), 404
    
    if sos.status != 'searching':
        return jsonify({'error': 'already_assigned', 'status': sos.status}), 400
    
    if sos.requester_id == user.id:
        return jsonify({'error': 'cannot_help_self'}), 400
    
    # Check if helper can help (trust score not critical)
    if user.trust_score is not None and user.trust_score < 10:
        return jsonify({'error': 'trust_score_too_low'}), 403
    
    # Calculate distance
    helper_lat = data.get('lat')
    helper_lng = data.get('lng')
    distance = None
    
    if helper_lat and helper_lng and sos.requester_lat and sos.requester_lng:
        distance = geodesic(
            (sos.requester_lat, sos.requester_lng),
            (helper_lat, helper_lng)
        ).kilometers
    
    # Update SOS
    sos.helper_id = user.id
    sos.status = 'assigned'
    sos.helper_lat_at_accept = helper_lat
    sos.helper_lng_at_accept = helper_lng
    sos.distance_at_accept = distance
    sos.accepted_at = datetime.utcnow()
    
    db.session.commit()
    
    print(f'[SOS] Request {sos_id} accepted by helper {user.id}, distance: {distance}km')
    
    return jsonify({'sos': sos.to_dict()}), 200


@app.route('/api/v1/sos/<string:sos_id>/location-update', methods=['POST'])
def api_v1_sos_location_update(sos_id):
    """Update helper's location during approach"""
    user, err = require_auth()
    if err:
        return err
    
    data = request.json or {}
    
    sos = SOSRequest.query.get(sos_id)
    if not sos:
        return jsonify({'error': 'not_found'}), 404
    
    if sos.helper_id != user.id:
        return jsonify({'error': 'not_helper'}), 403
    
    if sos.status not in ['assigned', 'approaching']:
        return jsonify({'error': 'invalid_status'}), 400
    
    # Update status to approaching if not already
    if sos.status == 'assigned':
        sos.status = 'approaching'
    
    # Calculate current distance
    helper_lat = data.get('lat')
    helper_lng = data.get('lng')
    current_distance = None
    
    if helper_lat and helper_lng and sos.requester_lat and sos.requester_lng:
        current_distance = geodesic(
            (sos.requester_lat, sos.requester_lng),
            (helper_lat, helper_lng)
        ).kilometers
    
    db.session.commit()
    
    return jsonify({
        'sos_id': sos_id,
        'status': sos.status,
        'current_distance': current_distance,
    }), 200


@app.route('/api/v1/sos/<string:sos_id>/arrived', methods=['POST'])
def api_v1_sos_arrived(sos_id):
    """Mark helper as arrived with server-side validation"""
    user, err = require_auth()
    if err:
        return err
    
    data = request.json or {}
    
    sos = SOSRequest.query.get(sos_id)
    if not sos:
        return jsonify({'error': 'not_found'}), 404
    
    if sos.helper_id != user.id:
        return jsonify({'error': 'not_helper'}), 403
    
    if sos.status not in ['assigned', 'approaching']:
        return jsonify({'error': 'invalid_status'}), 400
    
    # SERVER-SIDE VALIDATION: Sanity checks on arrival
    validation_warnings = []
    
    # Calculate arrival time
    arrival_time = None
    if sos.accepted_at:
        arrival_time = int((datetime.utcnow() - sos.accepted_at).total_seconds())
        
        # Validation: Unrealistically fast arrival (< 30 seconds)
        if arrival_time < 30:
            validation_warnings.append('arrival_too_fast')
            audit_log('sos_arrival_suspicious', {
                'sos_id': sos_id,
                'helper_id': user.id,
                'arrival_time_seconds': arrival_time,
                'reason': 'arrival_under_30_seconds',
            })
        
        # Validation: Unrealistically long arrival (> 1 hour)
        if arrival_time > 3600:
            validation_warnings.append('arrival_too_slow')
            audit_log('sos_arrival_suspicious', {
                'sos_id': sos_id,
                'helper_id': user.id,
                'arrival_time_seconds': arrival_time,
                'reason': 'arrival_over_1_hour',
            })
    
    # Validation: Check distance if provided
    helper_lat = data.get('lat')
    helper_lng = data.get('lng')
    if helper_lat and helper_lng and sos.requester_lat and sos.requester_lng:
        current_distance = geodesic(
            (sos.requester_lat, sos.requester_lng),
            (helper_lat, helper_lng)
        ).kilometers
        
        # If helper claims arrival but is > 100m away, flag it
        if current_distance > 0.1:
            validation_warnings.append('distance_mismatch')
            audit_log('sos_arrival_suspicious', {
                'sos_id': sos_id,
                'helper_id': user.id,
                'claimed_distance_km': current_distance,
                'reason': 'arrival_claimed_but_far',
            })
    
    sos.status = 'awaiting_confirmation'
    sos.arrived_at = datetime.utcnow()
    sos.arrival_time_seconds = arrival_time
    
    # Update helper's arrival stats
    helper = User.query.get(user.id)
    if helper and arrival_time:
        helper.total_arrival_time = (helper.total_arrival_time or 0) + arrival_time
        helper.arrival_count = (helper.arrival_count or 0) + 1
        helper.avg_arrival_time = helper.total_arrival_time / helper.arrival_count
    
    db.session.commit()
    
    audit_log('sos_helper_arrived', {
        'sos_id': sos_id,
        'helper_id': user.id,
        'requester_id': sos.requester_id,
        'arrival_time_seconds': arrival_time,
        'validation_warnings': validation_warnings,
    })
    
    return jsonify({
        'sos': sos.to_dict(),
        'validation_warnings': validation_warnings,
    }), 200


@app.route('/api/v1/sos/<string:sos_id>/confirm', methods=['POST'])
def api_v1_sos_confirm(sos_id):
    """
    Requester confirms help received.
    
    PRODUCTION-READY:
    - Atomic transaction (all-or-nothing)
    - Idempotent (duplicate calls return same result)
    - Server-side validation
    - Audit logging
    """
    user, err = require_auth()
    if err:
        return err
    
    data = request.json or {}
    confirmed = data.get('confirmed', True)
    idempotency_key = data.get('idempotency_key')  # Optional client-provided key
    
    sos = SOSRequest.query.get(sos_id)
    if not sos:
        return jsonify({'error': 'not_found'}), 404
    
    if sos.requester_id != user.id:
        return jsonify({'error': 'not_requester'}), 403
    
    # IDEMPOTENCY: If already resolved, return existing result
    if sos.status in ['resolved_confirmed', 'resolved_unconfirmed']:
        existing_reward = SOSReward.query.filter_by(sos_request_id=sos_id).first()
        
        audit_log('sos_confirm_duplicate', {
            'sos_id': sos_id,
            'requester_id': user.id,
            'existing_status': sos.status,
            'idempotency_key': idempotency_key,
        })
        
        if existing_reward:
            return jsonify({
                'sos': sos.to_dict(),
                'reward': {
                    'granted': True,
                    'total_reward': existing_reward.total_amount,
                    'already_processed': True,
                },
            }), 200
        else:
            return jsonify({
                'sos': sos.to_dict(),
                'reward': {'granted': False, 'reason': 'already_resolved', 'already_processed': True},
            }), 200
    
    if sos.status != 'awaiting_confirmation':
        return jsonify({'error': 'invalid_status', 'status': sos.status}), 400
    
    helper = User.query.get(sos.helper_id)
    if not helper:
        return jsonify({'error': 'helper_not_found'}), 404
    
    # ATOMIC TRANSACTION: Begin explicit transaction
    try:
        reward_result = None
        
        if confirmed:
            # CONFIRMED - Grant reward atomically
            sos.status = 'resolved_confirmed'
            sos.resolved_at = datetime.utcnow()
            
            # Update helper stats
            helper.total_helps = (helper.total_helps or 0) + 1
            helper.confirmed_helps = (helper.confirmed_helps or 0) + 1
            
            # Calculate reward with bonuses
            base_reward = SOS_REWARD_CONFIG['base_reward']
            bonuses = []
            bonus_total = 0
            
            # First help of day bonus
            daily_rewards = get_helper_daily_rewards(helper.id)
            if daily_rewards == 0:
                bonus = SOS_REWARD_CONFIG['bonus_first_help']
                bonuses.append({'type': 'first_help_of_day', 'amount': bonus, 'label': 'First help today! 🌟'})
                bonus_total += bonus
            
            # Long distance bonus (> 500m)
            if sos.distance_at_accept and sos.distance_at_accept >= 0.5:
                bonus = SOS_REWARD_CONFIG['bonus_long_distance']
                bonuses.append({'type': 'long_distance', 'amount': bonus, 'label': f'Traveled {int(sos.distance_at_accept * 1000)}m 🚶'})
                bonus_total += bonus
            
            # Fast arrival bonus (< 5 min)
            if sos.arrival_time_seconds and sos.arrival_time_seconds < 300:
                bonus = SOS_REWARD_CONFIG['bonus_fast_arrival']
                bonuses.append({'type': 'fast_arrival', 'amount': bonus, 'label': 'Quick response! ⚡'})
                bonus_total += bonus
            
            # Trusted helper bonus
            if helper.trust_score and helper.trust_score >= SOS_REWARD_CONFIG['trusted_helper_threshold']:
                bonus = SOS_REWARD_CONFIG['bonus_trusted_helper']
                bonuses.append({'type': 'trusted_helper', 'amount': bonus, 'label': 'Trusted Helper 🛡️'})
                bonus_total += bonus
            
            # Check diminishing returns for same pair
            interaction, weekly_count = check_pair_interaction(helper.id, user.id)
            multiplier = 1.0
            if weekly_count >= 4:
                multiplier = 0
            elif weekly_count == 3:
                multiplier = 0.25
            elif weekly_count == 2:
                multiplier = 0.5
            elif weekly_count == 1:
                multiplier = 0.75
            
            total_reward = int((base_reward + bonus_total) * multiplier)
            
            # Check daily limit
            if daily_rewards >= SOS_REWARD_CONFIG['max_rewards_per_day']:
                total_reward = 0
                bonuses = []
            
            if total_reward > 0:
                # IDEMPOTENCY CHECK: Ensure no duplicate reward exists
                existing_reward = SOSReward.query.filter_by(sos_request_id=sos.id).first()
                if existing_reward:
                    # Reward already exists - return existing
                    db.session.rollback()
                    audit_log('sos_reward_duplicate_prevented', {
                        'sos_id': sos_id,
                        'helper_id': helper.id,
                        'existing_reward_id': existing_reward.id,
                    })
                    return jsonify({
                        'sos': sos.to_dict(),
                        'reward': {
                            'granted': True,
                            'total_reward': existing_reward.total_amount,
                            'already_processed': True,
                        },
                    }), 200
                
                # Create reward record
                reward = SOSReward(
                    helper_id=helper.id,
                    requester_id=user.id,
                    sos_request_id=sos.id,
                    base_amount=base_reward,
                    bonus_amount=bonus_total,
                    total_amount=total_reward,
                    bonuses_json=json.dumps(bonuses),
                )
                db.session.add(reward)
                
                # Update helper's points balance
                helper.points_balance = (helper.points_balance or 0) + total_reward
                
                # Create points transaction
                transaction = PointsTransaction(
                    user_id=helper.id,
                    type='helper_reward',
                    amount=total_reward,
                    reference_id=reward.id,
                    reference_type='sos_reward',
                    balance_after=helper.points_balance,
                    description=f'SOS help reward (+{total_reward} points)',
                )
                db.session.add(transaction)
                
                # Update pair interaction
                if interaction:
                    interaction.interaction_count += 1
                    interaction.weekly_count += 1
                    interaction.last_interaction = datetime.utcnow()
                    interaction.updated_at = datetime.utcnow()
                else:
                    today = date.today()
                    week_start = today - timedelta(days=today.weekday())
                    interaction = HelperInteraction(
                        helper_id=helper.id,
                        requester_id=user.id,
                        interaction_count=1,
                        weekly_count=1,
                        week_start=week_start,
                        last_interaction=datetime.utcnow(),
                    )
                    db.session.add(interaction)
                
                reward_result = {
                    'granted': True,
                    'total_reward': total_reward,
                    'base_reward': base_reward,
                    'bonuses': bonuses,
                    'multiplier': multiplier,
                }
                
                # AUDIT LOG: Reward granted
                audit_log('sos_reward_granted', {
                    'sos_id': sos_id,
                    'helper_id': helper.id,
                    'requester_id': user.id,
                    'total_reward': total_reward,
                    'base_reward': base_reward,
                    'bonuses': [b['type'] for b in bonuses],
                    'multiplier': multiplier,
                    'helper_new_balance': helper.points_balance,
                })
            else:
                reward_result = {
                    'granted': False,
                    'reason': 'daily_limit' if daily_rewards >= SOS_REWARD_CONFIG['max_rewards_per_day'] else 'diminishing_returns',
                }
                
                # AUDIT LOG: Reward blocked
                audit_log('sos_reward_blocked', {
                    'sos_id': sos_id,
                    'helper_id': helper.id,
                    'requester_id': user.id,
                    'reason': reward_result['reason'],
                    'daily_rewards': daily_rewards,
                    'weekly_count': weekly_count,
                })
            
            # Recalculate trust score
            helper.trust_score = calculate_trust_score(helper)
            
            # AUDIT LOG: Confirmation event
            audit_log('sos_confirmed', {
                'sos_id': sos_id,
                'helper_id': helper.id,
                'requester_id': user.id,
                'reward_granted': reward_result.get('granted', False),
                'helper_new_trust_score': helper.trust_score,
            })
            
        else:
            # NOT CONFIRMED (timeout or explicit no)
            sos.status = 'resolved_unconfirmed'
            sos.resolved_at = datetime.utcnow()
            
            # Update helper stats (no reward)
            helper.total_helps = (helper.total_helps or 0) + 1
            helper.unconfirmed_helps = (helper.unconfirmed_helps or 0) + 1
            
            # Recalculate trust score
            helper.trust_score = calculate_trust_score(helper)
            
            reward_result = {'granted': False, 'reason': 'not_confirmed'}
            
            # AUDIT LOG: Unconfirmed event
            audit_log('sos_unconfirmed', {
                'sos_id': sos_id,
                'helper_id': helper.id,
                'requester_id': user.id,
                'helper_new_trust_score': helper.trust_score,
            })
        
        # ATOMIC COMMIT: All changes committed together
        db.session.commit()
        
        return jsonify({
            'sos': sos.to_dict(),
            'reward': reward_result,
        }), 200
        
    except Exception as e:
        # ATOMIC ROLLBACK: On any error, rollback all changes
        db.session.rollback()
        
        audit_log('sos_confirm_error', {
            'sos_id': sos_id,
            'requester_id': user.id,
            'error': str(e),
        })
        
        print(f'[SOS ERROR] Confirm failed for {sos_id}: {str(e)}')
        return jsonify({'error': 'confirmation_failed', 'message': str(e)}), 500


@app.route('/api/v1/sos/<string:sos_id>/cancel', methods=['POST'])
def api_v1_sos_cancel(sos_id):
    """Cancel an SOS request"""
    user, err = require_auth()
    if err:
        return err
    
    data = request.json or {}
    reason = data.get('reason', 'user_cancelled')
    
    sos = SOSRequest.query.get(sos_id)
    if not sos:
        return jsonify({'error': 'not_found'}), 404
    
    # Only requester or helper can cancel
    if sos.requester_id != user.id and sos.helper_id != user.id:
        return jsonify({'error': 'not_authorized'}), 403
    
    if sos.status in ['resolved_confirmed', 'resolved_unconfirmed', 'cancelled']:
        return jsonify({'error': 'already_resolved'}), 400
    
    # Track who cancelled
    cancelled_by = 'requester' if sos.requester_id == user.id else 'helper'
    
    # Update stats based on who cancelled and at what stage
    if cancelled_by == 'requester':
        requester = User.query.get(sos.requester_id)
        if requester:
            requester.cancelled_requests = (requester.cancelled_requests or 0) + 1
    elif sos.helper_id:
        # Helper cancelled after accepting
        helper = User.query.get(sos.helper_id)
        if helper:
            helper.abandonment_count = (helper.abandonment_count or 0) + 1
            helper.trust_score = calculate_trust_score(helper)
    
    sos.status = 'cancelled'
    sos.resolved_at = datetime.utcnow()
    
    db.session.commit()
    
    print(f'[SOS] Request {sos_id} cancelled by {cancelled_by}, reason: {reason}')
    
    return jsonify({'sos': sos.to_dict()}), 200


@app.route('/api/v1/sos/<string:sos_id>/helper-unavailable', methods=['POST'])
def api_v1_sos_helper_unavailable(sos_id):
    """Mark helper as unavailable (no heartbeat)"""
    user, err = require_auth()
    if err:
        return err
    
    sos = SOSRequest.query.get(sos_id)
    if not sos:
        return jsonify({'error': 'not_found'}), 404
    
    if sos.requester_id != user.id:
        return jsonify({'error': 'not_requester'}), 403
    
    if sos.status not in ['assigned', 'approaching']:
        return jsonify({'error': 'invalid_status'}), 400
    
    # Update helper's abandonment count
    if sos.helper_id:
        helper = User.query.get(sos.helper_id)
        if helper:
            helper.abandonment_count = (helper.abandonment_count or 0) + 1
            helper.trust_score = calculate_trust_score(helper)
    
    # Reset to searching
    sos.helper_id = None
    sos.status = 'searching'
    sos.accepted_at = None
    sos.helper_lat_at_accept = None
    sos.helper_lng_at_accept = None
    sos.distance_at_accept = None
    
    db.session.commit()
    
    print(f'[SOS] Helper unavailable for request {sos_id}, resuming search')
    
    return jsonify({'sos': sos.to_dict()}), 200


@app.route('/api/v1/users/<int:user_id>/trust-score', methods=['GET'])
def api_v1_get_trust_score(user_id):
    """Get user's trust score and stats"""
    auth_user, err = require_auth()
    if err:
        return err
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'not_found'}), 404
    
    # Calculate success rate
    success_rate = None
    if user.total_helps and user.total_helps > 0:
        success_rate = round((user.confirmed_helps or 0) / user.total_helps * 100)
    
    return jsonify({
        'user_id': user_id,
        'trust_score': round(user.trust_score or 50, 1),
        'is_trusted_helper': (user.trust_score or 50) >= SOS_REWARD_CONFIG['trusted_helper_threshold'],
        'stats': {
            'total_helps': user.total_helps or 0,
            'confirmed_helps': user.confirmed_helps or 0,
            'unconfirmed_helps': user.unconfirmed_helps or 0,
            'success_rate': success_rate,
            'avg_arrival_time': round(user.avg_arrival_time or 0),
            'abandonment_count': user.abandonment_count or 0,
        },
    }), 200


@app.route('/api/v1/users/<int:user_id>/points', methods=['GET'])
def api_v1_get_points(user_id):
    """Get user's points balance"""
    auth_user, err = require_auth()
    if err:
        return err
    
    # Only allow users to see their own points
    if auth_user.id != user_id:
        return jsonify({'error': 'not_authorized'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'not_found'}), 404
    
    # Get recent transactions
    transactions = PointsTransaction.query.filter_by(user_id=user_id).order_by(
        PointsTransaction.created_at.desc()
    ).limit(20).all()
    
    return jsonify({
        'user_id': user_id,
        'points_balance': user.points_balance or 0,
        'transactions': [t.to_dict() for t in transactions],
    }), 200


@app.route('/api/v1/users/<int:user_id>/help-history', methods=['GET'])
def api_v1_get_help_history(user_id):
    """Get user's SOS help history"""
    auth_user, err = require_auth()
    if err:
        return err
    
    # Only allow users to see their own history
    if auth_user.id != user_id:
        return jsonify({'error': 'not_authorized'}), 403
    
    # Get SOS requests where user was helper
    helped = SOSRequest.query.filter_by(helper_id=user_id).order_by(
        SOSRequest.created_at.desc()
    ).limit(50).all()
    
    # Get SOS requests where user was requester
    requested = SOSRequest.query.filter_by(requester_id=user_id).order_by(
        SOSRequest.created_at.desc()
    ).limit(50).all()
    
    return jsonify({
        'user_id': user_id,
        'as_helper': [s.to_dict() for s in helped],
        'as_requester': [s.to_dict() for s in requested],
    }), 200


@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    try:
        # Test DB connection
        user_count = User.query.count()
        return jsonify({
            'status': 'healthy',
            'db_connected': True,
            'user_count': user_count,
            'db_info': _DB_INFO,
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'db_connected': False,
            'error': str(e),
        }), 500


if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
