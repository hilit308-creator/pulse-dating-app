from __future__ import with_statement

import os
from logging.config import fileConfig

from alembic import context
from flask import current_app

# this is the Alembic Config object, which provides access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def _get_database_url():
    url = os.getenv('DATABASE_URL')
    if url and url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql://', 1)
    if url:
        return url
    try:
        return current_app.config.get('SQLALCHEMY_DATABASE_URI')
    except Exception:
        return None


def get_metadata():
    try:
        return current_app.extensions['migrate'].db.metadata
    except Exception:
        return None


def run_migrations_offline():
    url = _get_database_url() or config.get_main_option('sqlalchemy.url')
    context.configure(
        url=url,
        target_metadata=get_metadata(),
        literal_binds=True,
        dialect_opts={'paramstyle': 'named'},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = current_app.extensions['migrate'].db.engine

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=get_metadata())

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
