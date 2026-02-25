"""nearby core tables

Revision ID: 0001_nearby_core
Revises: 
Create Date: 2026-02-03

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0001_nearby_core'
down_revision = '0000_create_user'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'feature_flags',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('env', sa.String(length=20), nullable=False),
        sa.Column('key', sa.String(length=120), nullable=False),
        sa.Column('value_json', sa.Text(), nullable=False),
        sa.Column('updated_by_user_id', sa.Integer(), sa.ForeignKey('user.id')),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('env', 'key', name='uniq_feature_flag_env_key'),
    )

    op.create_table(
        'feature_flag_audit_logs',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('env', sa.String(length=20), nullable=False),
        sa.Column('key', sa.String(length=120), nullable=False),
        sa.Column('old_value_json', sa.Text()),
        sa.Column('new_value_json', sa.Text()),
        sa.Column('updated_by_user_id', sa.Integer(), sa.ForeignKey('user.id')),
        sa.Column('reason', sa.Text()),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )

    op.create_table(
        'venue_partner_tiers',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('google_place_id', sa.String(length=255), nullable=False),
        sa.Column('partner_name', sa.String(length=255)),
        sa.Column('plan_tier', sa.String(length=20), nullable=False),
        sa.Column('priority_override', sa.Integer()),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('starts_at', sa.DateTime()),
        sa.Column('ends_at', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('google_place_id', name='uq_venue_partner_tiers_google_place_id'),
    )

    op.create_table(
        'payment_holds',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False),
        sa.Column('currency', sa.String(length=10), nullable=False, server_default='ils'),
        sa.Column('amount_cents', sa.Integer(), nullable=False),
        sa.Column('stripe_payment_intent_id', sa.String(length=255), unique=True),
        sa.Column('stripe_customer_id', sa.String(length=255)),
        sa.Column('stripe_payment_method_id', sa.String(length=255)),
        sa.Column('failure_code', sa.String(length=120)),
        sa.Column('failure_message', sa.Text()),
        sa.Column('expires_at', sa.DateTime()),
        sa.Column('captured_at', sa.DateTime()),
        sa.Column('released_at', sa.DateTime()),
        sa.Column('metadata_json', sa.Text(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )

    op.create_table(
        'nearby_invites',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('inviter_user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('invitee_user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('invite_type', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('message_text', sa.Text()),
        sa.Column('venue_google_place_id', sa.String(length=255)),
        sa.Column('venue_snapshot_json', sa.Text()),
        sa.Column('payment_hold_id', sa.String(length=36), sa.ForeignKey('payment_holds.id')),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('responded_at', sa.DateTime()),
        sa.Column('idempotency_key', sa.String(length=255)),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.CheckConstraint('inviter_user_id != invitee_user_id', name='chk_inviter_invitee_diff'),
        sa.UniqueConstraint('inviter_user_id', 'idempotency_key', name='uniq_nearby_invite_idempotency'),
    )

    op.create_table(
        'meetings',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('invite_id', sa.String(length=36), sa.ForeignKey('nearby_invites.id'), unique=True),
        sa.Column('match_id', sa.String(length=255)),
        sa.Column('inviter_user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('invitee_user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('venue_google_place_id', sa.String(length=255)),
        sa.Column('venue_snapshot_json', sa.Text()),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='scheduled'),
        sa.Column('scheduled_for', sa.DateTime()),
        sa.Column('started_at', sa.DateTime()),
        sa.Column('ended_at', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )

    op.create_table(
        'meeting_feedback',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('meeting_id', sa.String(length=36), sa.ForeignKey('meetings.id'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('meeting_feel', sa.String(length=20)),
        sa.Column('venue_rating', sa.Integer()),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('meeting_id', 'user_id', name='uniq_feedback_meeting_user'),
    )

    op.create_table(
        'ledger_entries',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id')),
        sa.Column('invite_id', sa.String(length=36), sa.ForeignKey('nearby_invites.id')),
        sa.Column('meeting_id', sa.String(length=36), sa.ForeignKey('meetings.id')),
        sa.Column('hold_id', sa.String(length=36), sa.ForeignKey('payment_holds.id')),
        sa.Column('event_type', sa.String(length=60), nullable=False),
        sa.Column('amount_cents', sa.Integer()),
        sa.Column('currency', sa.String(length=10)),
        sa.Column('stripe_event_id', sa.String(length=255), unique=True),
        sa.Column('details_json', sa.Text(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )


def downgrade():
    op.drop_table('ledger_entries')
    op.drop_table('meeting_feedback')
    op.drop_table('meetings')
    op.drop_table('nearby_invites')
    op.drop_table('payment_holds')
    op.drop_table('venue_partner_tiers')
    op.drop_table('feature_flag_audit_logs')
    op.drop_table('feature_flags')
