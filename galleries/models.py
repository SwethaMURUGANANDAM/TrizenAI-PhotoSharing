from django.db import models
from events.models import Event
from photos.models import Photo
# Create your models here.
class Gallery(models.Model):
    event=models.OneToOneField(Event,on_delete=models.CASCADE)
    public_token = models.CharField(max_length=100, unique=True)
    pin = models.CharField(max_length=128)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
class GalleryPhoto(models.Model):
    gallery=models.ForeignKey(Gallery, on_delete=models.CASCADE)
    photo = models.ForeignKey(Photo, on_delete=models.CASCADE)
class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['gallery', 'photo'],
                name='unique_gallery_photo'
            )
        ]
