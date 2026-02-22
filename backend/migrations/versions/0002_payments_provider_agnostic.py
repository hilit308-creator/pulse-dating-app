"""payments provider agnostic

Revision ID: 0002_payments_provider_agnostic
Revises: 0001_nearby_core
Create Date: 2026-02-03

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0002_payments_provider_agnostic'
down_revision = '0001_nearby_core'
branch_labels = None
depends_on = None


def upgrade():
    # payment_holds: add provider-agnostic reference fields
    with op.batch_alter_table('payment_holds', schema=None) as batch_op:
        batch_op.add_column(sa.Column('provider', sa.String(length=30), nullable=False, server_default='mock'))
        batch_op.add_column(sa.Column('provider_hold_id', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('provider_customer_id', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('provider_payment_method_id', sa.String(length=255), nullable=True))

    op.create_index(
        'uq_payment_holds_provider_hold_id',
        'payment_holds',
        ['provider_hold_id'],
        unique=True,
    )

    # ledger_entries: add provider + provider event id for generic webhook/event de-dupe
    with op.batch_alter_table('ledger_entries', schema=None) as batch_op:
        batch_op.add_column(sa.Column('provider', sa.String(length=30), nullable=True))
        batch_op.add_column(sa.Column('provider_event_id', sa.String(length=255), nullable=True))

    op.create_index(
        'uq_ledger_entries_provider_event_id',
        'ledger_entries',
        ['provider_event_id'],
        unique=True,
    )


def downgrade():
    op.drop_index('uq_ledger_entries_provider_event_id', table_name='ledger_entries')
    with op.batch_alter_table('ledger_entries', schema=None) as batch_op:
        batch_op.drop_column('provider_event_id')
        batch_op.drop_column('provider')

    op.drop_index('uq_payment_holds_provider_hold_id', table_name='payment_holds')
    with op.batch_alter_table('payment_holds', schema=None) as batch_op:
        batch_op.drop_column('provider_payment_method_id')
        batch_op.drop_column('provider_customer_id')
        batch_op.drop_column('provider_hold_id')
        batch_op.drop_column('provider')
