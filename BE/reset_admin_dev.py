"""Reset or create a development Admin account without changing other users."""
import argparse
import getpass
from werkzeug.security import generate_password_hash
from app import create_app, db
from app.domain.models import Role, User

def main():
    parser = argparse.ArgumentParser(description="Reset/create a development Admin account")
    parser.add_argument("--username", default="truonggiang")
    parser.add_argument("--password", help="New development password; if omitted, prompt securely")
    args = parser.parse_args()
    password = args.password or getpass.getpass("New development password: ")
    if len(password) < 8:
        parser.error("password must contain at least 8 characters")
    app = create_app()
    with app.app_context():
        admin_role = Role.query.filter_by(name="Admin").first()
        if admin_role is None:
            admin_role = Role(name="Admin")
            db.session.add(admin_role)
            db.session.flush()
        user = User.query.filter_by(username=args.username).first()
        created = user is None
        if created:
            user = User(username=args.username, password_hash=generate_password_hash(password))
            db.session.add(user)
        else:
            user.password_hash = generate_password_hash(password)
            user.is_active = True
        if admin_role not in user.roles:
            user.roles.append(admin_role)
        db.session.commit()
        print(f"Development Admin account {'created' if created else 'reset'}: {user.username}")

if __name__ == "__main__":
    main()
