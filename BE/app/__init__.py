import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect, text
from dotenv import load_dotenv

load_dotenv()
db = SQLAlchemy()

# SQLite's create_all() does not add columns to existing tables.  The project
# database predates the current models, so apply only additive migrations here.
def _migrate_existing_schema():
    inspector = inspect(db.engine)
    additions = {
        'activity_schedules': {
            'ends_at': 'DATETIME',
            'location': 'VARCHAR(160)',
            'fee': 'NUMERIC(12, 2)',
        },
        'activity_registrations': {
            'registered_at': 'DATETIME',
        },
    }
    if db.engine.dialect.name != 'sqlite':
        return
    with db.engine.begin() as connection:
        for table, columns in additions.items():
            if not inspector.has_table(table):
                continue
            existing = {column['name'] for column in inspect(db.engine).get_columns(table)}
            for name, sql_type in columns.items():
                if name not in existing:
                    connection.execute(text(f'ALTER TABLE {table} ADD COLUMN {name} {sql_type}'))


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_mapping(
        SECRET_KEY=os.getenv('SECRET_KEY', 'oceanflow-development-only-change-me-32'),
        SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL', 'sqlite:///oceanflow.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )
    if test_config:
        app.config.update(test_config)
    db.init_app(app)
    CORS(app)
    from .api.routes import api
    app.register_blueprint(api, url_prefix='/api/v1')
    with app.app_context():
        db.create_all()
        _migrate_existing_schema()

    @app.get('/health')
    def health():
        return jsonify({'status': 'ok', 'service': 'oceanflow-api', 'version': '1.0'})

    return app
