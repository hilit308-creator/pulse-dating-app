"""Add Spotify OAuth token columns to user table

Revision ID: 0006_spotify_oauth
Revises: 0005_user_location_idx
Create Date: 2026-02-27

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0006_spotify_oauth'
down_revision = '0005_user_location_idx'
branch_labels = None
depends_on = None


def upgrade():
    # Add Spotify OAuth columns to user table
    op.add_column('user', sa.Column('spotify_access_token', sa.Text(), nullable=True))
    op.add_column('user', sa.Column('spotify_refresh_token', sa.Text(), nullable=True))
    op.add_column('user', sa.Column('spotify_token_expires_at', sa.DateTime(), nullable=True))


def downgrade():
    # Remove Spotify OAuth columns
    op.drop_column('user', 'spotify_token_expires_at')
    op.drop_column('user', 'spotify_refresh_token')
    op.drop_column('user', 'spotify_access_token')
