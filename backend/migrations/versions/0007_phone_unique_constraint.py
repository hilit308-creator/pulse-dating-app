"""Add unique constraint to phone_number column

Revision ID: 0007_phone_unique
Revises: 0006_spotify_oauth
Create Date: 2026-02-27

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0007_phone_unique'
down_revision = '0006_spotify_oauth'
branch_labels = None
depends_on = None


def upgrade():
    # Add unique constraint to phone_number
    # First, we need to handle any existing duplicates
    # This will fail if there are duplicates - clean them up manually first
    op.create_unique_constraint('uq_user_phone_number', 'user', ['phone_number'])


def downgrade():
    op.drop_constraint('uq_user_phone_number', 'user', type_='unique')
