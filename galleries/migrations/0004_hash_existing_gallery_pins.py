
from django.db import migrations
from django.contrib.auth.hashers import make_password, identify_hasher


def hash_existing_gallery_pins(apps, schema_editor):
    Gallery = apps.get_model("galleries", "Gallery")

    for gallery in Gallery.objects.all():
        try:
            identify_hasher(gallery.pin)
        except ValueError:
            gallery.pin = make_password(gallery.pin)
            gallery.save(update_fields=["pin"])


class Migration(migrations.Migration):

    dependencies = [
        ("galleries", "0003_alter_gallery_pin"),
    ]

    operations = [
        migrations.RunPython(hash_existing_gallery_pins),
    ]