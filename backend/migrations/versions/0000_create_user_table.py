"""create user table

Revision ID: 0000_create_user
Revises: 
Create Date: 2026-02-23

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0000_create_user'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('first_name', sa.String(length=50), nullable=False),
        sa.Column('last_name', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=120), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(length=128), nullable=True),
        sa.Column('phone_number', sa.String(length=20), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('show_me', sa.String(length=20), server_default='Everyone'),
        sa.Column('role', sa.String(length=20), server_default='user'),
        sa.Column('residence', sa.String(length=100), nullable=True),
        sa.Column('place_of_origin', sa.String(length=100), nullable=True),
        sa.Column('looking_for', sa.String(length=50), nullable=True),
        sa.Column('relationship_type', sa.String(length=50), nullable=True),
        sa.Column('hobbies', sa.String(length=1000), nullable=True),
        sa.Column('interests', sa.String(length=1000), nullable=True),
        sa.Column('favorite_songs', sa.String(length=500), nullable=True),
        sa.Column('approach_preferences', sa.String(length=1000), nullable=True),
        sa.Column('custom_approach', sa.String(length=500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('last_active', sa.DateTime(), nullable=True),
    )


def downgrade():
    op.drop_table('user')
