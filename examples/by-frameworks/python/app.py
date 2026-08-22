"""Example module documentation."""

from pathlib import Path

title = _("existing.key")


def render(name, user):
    print("Welcome back")
    message = f"Hello {name}, profile {user.name!r}"
    cache = Path("Runtime cache directory")
    return message, cache
