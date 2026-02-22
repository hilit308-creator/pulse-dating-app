"""todays_picks table for daily curated picks

Revision ID: 0004_todays_picks
Revises: 0003_external_api_usage
Create Date: 2026-02-23

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0004_todays_picks'
down_revision = '0003_external_api_usage'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'todays_picks',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('pick_user_id', sa.Integer(), sa.ForeignKey('user.id'), nullable=False),
        sa.Column('pick_date', sa.Date(), nullable=False),
        sa.Column('meeting_likelihood', sa.Float(), server_default='0.0'),
        sa.Column('meeting_context', sa.String(length=50), nullable=True),
        sa.Column('dismissed', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint('user_id', 'pick_user_id', 'pick_date', name='unique_daily_pick'),
    )
    op.create_index('ix_todays_picks_user_date', 'todays_picks', ['user_id', 'pick_date'])


def downgrade():
    op.drop_index('ix_todays_picks_user_date', table_name='todays_picks')
    op.drop_table('todays_picks')
