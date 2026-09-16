
import os

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from accounts.models import UserProfile


class Command(BaseCommand):
    help = "Create or update the demo admin user"

    def handle(self, *args, **kwargs):
        username = os.getenv("DEMO_ADMIN_USERNAME")
        password = os.getenv("DEMO_ADMIN_PASSWORD")

        if not username or not password:
            self.stdout.write(
                self.style.WARNING(
                    "DEMO_ADMIN_USERNAME or DEMO_ADMIN_PASSWORD is not set."
                )
            )
            return

        user, created = User.objects.get_or_create(
            username=username
        )

        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        UserProfile.objects.update_or_create(
            user=user,
            defaults={"role": "ADMIN"}
        )

        action = "created" if created else "updated"

        self.stdout.write(
            self.style.SUCCESS(
                f"Demo admin user {action} successfully."
            )
        )