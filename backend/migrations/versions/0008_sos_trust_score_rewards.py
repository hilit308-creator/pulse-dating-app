"""SOS Trust Score + Rewards System

Revision ID: 0008_sos_trust_score
Revises: 0007_phone_unique_constraint
Create Date: 2026-03-18

Adds tables and columns for:
- SOS requests tracking
- Rewards system
- Points transactions
- Helper interactions (anti-abuse)
- Trust score fields on User
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0008_sos_trust_score'
down_revision = '0007_phone_unique_constraint'
branch_labels = None
depends_on = None


def upgrade():
    # Add trust score fields to User table
    op.add_column('user', sa.Column('trust_score', sa.Float(), nullable=True, server_default='50.0'))
    op.add_column('user', sa.Column('total_helps', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('user', sa.Column('confirmed_helps', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('user', sa.Column('unconfirmed_helps', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('user', sa.Column('abandonment_count', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('user', sa.Column('avg_arrival_time', sa.Float(), nullable=True, server_default='0.0'))
    op.add_column('user', sa.Column('total_arrival_time', sa.Float(), nullable=True, server_default='0.0'))
    op.add_column('user', sa.Column('arrival_count', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('user', sa.Column('points_balance', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('user', sa.Column('total_sos_requests', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('user', sa.Column('cancelled_requests', sa.Integer(), nullable=True, server_default='0'))

    # Create SOS Requests table
    op.create_table(
        'sos_requests',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('requester_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('helper_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=True),
        sa.Column('status', sa.String(30), nullable=False, server_default='searching'),
        sa.Column('requester_lat', sa.Float(), nullable=True),
        sa.Column('requester_lng', sa.Float(), nullable=True),
        sa.Column('helper_lat_at_accept', sa.Float(), nullable=True),
        sa.Column('helper_lng_at_accept', sa.Float(), nullable=True),
        sa.Column('distance_at_accept', sa.Float(), nullable=True),
        sa.Column('arrival_time_seconds', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('accepted_at', sa.DateTime(), nullable=True),
        sa.Column('arrived_at', sa.DateTime(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_sos_requests_requester_id', 'sos_requests', ['requester_id'])
    op.create_index('ix_sos_requests_helper_id', 'sos_requests', ['helper_id'])
    op.create_index('ix_sos_requests_status', 'sos_requests', ['status'])
    op.create_index('ix_sos_requests_created_at', 'sos_requests', ['created_at'])

    # Create SOS Rewards table
    op.create_table(
        'sos_rewards',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('helper_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('requester_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('sos_request_id', sa.String(36), sa.ForeignKey('sos_requests.id'), nullable=False, unique=True),  # UNIQUE: One reward per SOS (idempotency)
        sa.Column('base_amount', sa.Integer(), nullable=False, server_default='150'),
        sa.Column('bonus_amount', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('total_amount', sa.Integer(), nullable=False),
        sa.Column('bonuses_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_sos_rewards_helper_id', 'sos_rewards', ['helper_id'])
    op.create_index('ix_sos_rewards_created_at', 'sos_rewards', ['created_at'])
    op.create_index('ix_sos_rewards_sos_request_id', 'sos_rewards', ['sos_request_id'], unique=True)  # Unique index for idempotency

    # Create Points Transactions table
    op.create_table(
        'points_transactions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('type', sa.String(30), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('reference_id', sa.String(36), nullable=True),
        sa.Column('reference_type', sa.String(30), nullable=True),
        sa.Column('balance_after', sa.Integer(), nullable=False),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_points_transactions_user_id', 'points_transactions', ['user_id'])
    op.create_index('ix_points_transactions_type', 'points_transactions', ['type'])
    op.create_index('ix_points_transactions_created_at', 'points_transactions', ['created_at'])

    # Create Helper Interactions table (anti-abuse)
    op.create_table(
        'helper_interactions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('helper_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('requester_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('interaction_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('last_interaction', sa.DateTime(), nullable=True),
        sa.Column('weekly_count', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('week_start', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint('helper_id', 'requester_id', name='uniq_helper_requester_pair'),
    )
    op.create_index('ix_helper_interactions_helper_id', 'helper_interactions', ['helper_id'])
    op.create_index('ix_helper_interactions_requester_id', 'helper_interactions', ['requester_id'])


def downgrade():
    # Drop tables
    op.drop_table('helper_interactions')
    op.drop_table('points_transactions')
    op.drop_table('sos_rewards')
    op.drop_table('sos_requests')

    # Remove columns from User table
    op.drop_column('user', 'cancelled_requests')
    op.drop_column('user', 'total_sos_requests')
    op.drop_column('user', 'points_balance')
    op.drop_column('user', 'arrival_count')
    op.drop_column('user', 'total_arrival_time')
    op.drop_column('user', 'avg_arrival_time')
    op.drop_column('user', 'abandonment_count')
    op.drop_column('user', 'unconfirmed_helps')
    op.drop_column('user', 'confirmed_helps')
    op.drop_column('user', 'total_helps')
    op.drop_column('user', 'trust_score')
