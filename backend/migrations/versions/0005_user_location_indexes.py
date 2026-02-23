"""add indexes on user latitude and longitude for location queries

Revision ID: 0005_user_location_idx
Revises: 0004_todays_picks
Create Date: 2026-02-23

"""

from alembic import op


# revision identifiers, used by Alembic.
revision = '0005_user_location_idx'
down_revision = '0004_todays_picks'
branch_labels = None
depends_on = None


def upgrade():
    op.create_index('ix_user_latitude', 'user', ['latitude'])
    op.create_index('ix_user_longitude', 'user', ['longitude'])
    op.create_index('ix_user_last_active', 'user', ['last_active'])


def downgrade():
    op.drop_index('ix_user_last_active', table_name='user')
    op.drop_index('ix_user_longitude', table_name='user')
    op.drop_index('ix_user_latitude', table_name='user')
