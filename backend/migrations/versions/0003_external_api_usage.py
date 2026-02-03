"""external api usage quota tracking

Revision ID: 0003_external_api_usage
Revises: 0002_payments_provider_agnostic
Create Date: 2026-02-03

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0003_external_api_usage'
down_revision = '0002_payments_provider_agnostic'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'external_api_usage',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('api_name', sa.String(length=60), nullable=False),
        sa.Column('day', sa.Date(), nullable=False),
        sa.Column('count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.UniqueConstraint('api_name', 'day', name='uniq_external_api_usage_api_day'),
    )


def downgrade():
    op.drop_table('external_api_usage')
