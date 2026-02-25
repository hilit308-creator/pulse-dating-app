"""add indexes for location queries

Revision ID: 0001_add_location_indexes
Revises: 0000_create_user
Create Date: 2026-02-25

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0001_add_location_indexes'
down_revision = '0000_create_user'
branch_labels = None
depends_on = None


def upgrade():
    # Add indexes for efficient nearby queries
    op.create_index('ix_user_latitude', 'user', ['latitude'], unique=False)
    op.create_index('ix_user_longitude', 'user', ['longitude'], unique=False)
    op.create_index('ix_user_last_active', 'user', ['last_active'], unique=False)
    # Composite index for bounding box queries
    op.create_index('ix_user_lat_lng', 'user', ['latitude', 'longitude'], unique=False)


def downgrade():
    op.drop_index('ix_user_lat_lng', table_name='user')
    op.drop_index('ix_user_last_active', table_name='user')
    op.drop_index('ix_user_longitude', table_name='user')
    op.drop_index('ix_user_latitude', table_name='user')
