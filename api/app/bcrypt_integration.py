"""Valgfri bcrypt-integration, som ikke bruges af clear text-demoen."""

import bcrypt


def hash_password(password: str) -> str:
    """Lav et saltet bcrypt-hash, som kan gemmes i databasen."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Kontrollér et password mod et tidligere genereret bcrypt-hash."""
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"), password_hash.encode("utf-8")
        )
    except ValueError:
        return False
